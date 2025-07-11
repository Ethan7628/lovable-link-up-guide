
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { auth, db, storage } from './firebase';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class FirebaseApiClient {
  // Auth methods
  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
    age?: number;
    bio?: string;
    location?: string;
  }): Promise<ApiResponse> {
    try {
      console.log('Registering user with Firebase:', { ...userData, password: '[HIDDEN]' });
      
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;

      // Update the user's profile
      await updateProfile(user, {
        displayName: userData.name
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role || 'buyer',
        age: userData.age,
        bio: userData.bio,
        location: userData.location,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isVerified: false,
        rating: 0,
        totalReviews: 0
      });

      const token = await user.getIdToken();
      localStorage.setItem('token', token);

      return { 
        success: true, 
        data: { 
          token,
          user: {
            id: user.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'buyer'
          }
        }
      };
    } catch (error: any) {
      console.error('Firebase registration failed:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    }
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    try {
      console.log('Logging in user with Firebase:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      const token = await user.getIdToken();
      localStorage.setItem('token', token);

      return { 
        success: true, 
        data: { 
          token,
          user: {
            id: user.uid,
            name: userData?.name || user.displayName,
            email: user.email,
            role: userData?.role || 'buyer',
            ...userData
          }
        }
      };
    } catch (error: any) {
      console.error('Firebase login failed:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  }

  async getProfile(): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      return { 
        success: true, 
        data: {
          id: user.uid,
          name: userData?.name || user.displayName,
          email: user.email,
          ...userData
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateProfile(profileData: any): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      await updateDoc(doc(db, 'users', user.uid), {
        ...profileData,
        updatedAt: serverTimestamp()
      });

      return { success: true, data: profileData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async uploadProfilePicture(file: File): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const storageRef = ref(storage, `profiles/${user.uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await updateDoc(doc(db, 'users', user.uid), {
        photos: arrayUnion(downloadURL),
        updatedAt: serverTimestamp()
      });

      return { success: true, data: { url: downloadURL } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Posts methods
  async getPosts(params?: { page?: number; limit?: number; category?: string; location?: string }): Promise<ApiResponse> {
    try {
      let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      
      if (params?.limit) {
        q = query(q, limit(params.limit));
      }

      const querySnapshot = await getDocs(q);
      const posts = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const postData = docSnap.data();
          
          // Get provider data
          const providerDoc = await getDoc(doc(db, 'users', postData.providerId));
          const providerData = providerDoc.data();

          return {
            _id: docSnap.id,
            ...postData,
            providerId: {
              _id: postData.providerId,
              name: providerData?.name || 'Unknown',
              photos: providerData?.photos || [],
              rating: providerData?.rating || 0,
              totalReviews: providerData?.totalReviews || 0,
              location: providerData?.location,
              isVerified: providerData?.isVerified || false
            },
            createdAt: postData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          };
        })
      );

      return { success: true, data: posts };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createPost(formData: FormData): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const serviceCategory = formData.get('serviceCategory') as string;
      const price = parseFloat(formData.get('price') as string);
      const location = formData.get('location') as string;
      const tags = (formData.get('tags') as string)?.split(',') || [];

      // Upload images
      const images: string[] = [];
      const files = formData.getAll('images') as File[];
      
      for (const file of files) {
        if (file && file.size > 0) {
          const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          images.push(downloadURL);
        }
      }

      const postData = {
        title,
        description,
        images,
        serviceCategory,
        price: price || 0,
        location,
        tags,
        likes: [],
        comments: [],
        providerId: user.uid,
        createdAt: serverTimestamp(),
        views: 0
      };

      const docRef = await addDoc(collection(db, 'posts'), postData);

      return { success: true, data: { _id: docRef.id, ...postData } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getMyPosts(): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const q = query(
        collection(db, 'posts'), 
        where('providerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }));

      return { success: true, data: posts };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async likePost(postId: string): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        return { success: false, error: 'Post not found' };
      }

      const postData = postDoc.data();
      const likes = postData.likes || [];
      const isLiked = likes.includes(user.uid);

      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid)
        });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async addComment(postId: string, comment: string): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      const commentData = {
        _id: Date.now().toString(),
        userId: {
          _id: user.uid,
          name: userData?.name || user.displayName,
          photos: userData?.photos || []
        },
        comment,
        createdAt: new Date().toISOString()
      };

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(commentData)
      });

      const postDoc = await getDoc(postRef);
      const updatedComments = postDoc.data()?.comments || [];

      return { success: true, data: updatedComments };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deletePost(postId: string): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      await deleteDoc(doc(db, 'posts', postId));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Placeholder methods for other functionality
  async getServices(): Promise<ApiResponse> {
    // Implementation similar to posts
    return { success: true, data: [] };
  }

  async createService(serviceData: any): Promise<ApiResponse> {
    // Implementation for services
    return { success: true, data: serviceData };
  }

  async getBookings(): Promise<ApiResponse> {
    // Implementation for bookings
    return { success: true, data: [] };
  }

  async getProviderBookings(): Promise<ApiResponse> {
    // Implementation for provider bookings
    return { success: true, data: [] };
  }

  async createBooking(bookingData: any): Promise<ApiResponse> {
    // Implementation for bookings
    return { success: true, data: bookingData };
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse> {
    // Implementation for booking status updates
    return { success: true };
  }

  async cancelBooking(bookingId: string, cancellationReason?: string): Promise<ApiResponse> {
    // Implementation for booking cancellation
    return { success: true };
  }

  async createPaymentIntent(amount: number, serviceId?: string, providerId?: string): Promise<ApiResponse> {
    // Implementation for payment intents
    return { success: true, data: { paymentIntentId: 'mock_intent' } };
  }

  async confirmPayment(paymentIntentId: string): Promise<ApiResponse> {
    // Implementation for payment confirmation
    return { success: true };
  }

  async getPaymentHistory(): Promise<ApiResponse> {
    // Implementation for payment history
    return { success: true, data: [] };
  }
}

export const firebaseApiClient = new FirebaseApiClient();
