
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://bodyconnect-backend.vercel.app/api' 
  : 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'x-auth-token': token }),
    };
  }

  private getMultipartHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      ...(token && { 'x-auth-token': token }),
    };
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options?.headers,
        },
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'Request failed' }));
        throw new Error(errorData.msg || errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { 
          success: false, 
          error: 'Unable to connect to server. Please check your internet connection.' 
        };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async uploadRequest<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      console.log(`Making upload request to: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getMultipartHeaders(),
        body: formData,
      });

      console.log(`Upload response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'Upload failed' }));
        throw new Error(errorData.msg || errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload response data:', data);

      return { success: true, data };
    } catch (error) {
      console.error('Upload request failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
    age?: number;
    bio?: string;
    location?: string;
  }) {
    console.log('Registering user:', { ...userData, password: '[HIDDEN]' });
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    console.log('Logging in user:', email);
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadProfilePicture(formData: FormData) {
    return this.uploadRequest('/auth/upload-profile-picture', formData);
  }

  // Posts endpoints
  async getPosts(params?: { page?: number; limit?: number; category?: string; location?: string }) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    
    return this.request(`/posts${queryString}`);
  }

  async createPost(formData: FormData) {
    return this.uploadRequest('/posts', formData);
  }

  async getMyPosts() {
    return this.request('/posts/my-posts');
  }

  async likePost(postId: string) {
    return this.request(`/posts/${postId}/like`, {
      method: 'PUT',
    });
  }

  async addComment(postId: string, comment: string) {
    return this.request(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async deletePost(postId: string) {
    return this.request(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // Services endpoints
  async getServices() {
    return this.request('/services');
  }

  async createService(serviceData: any) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  // Bookings endpoints
  async getBookings() {
    return this.request('/bookings/my-bookings');
  }

  async getProviderBookings() {
    return this.request('/bookings/provider-bookings');
  }

  async createBooking(bookingData: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBookingStatus(bookingId: string, status: string) {
    return this.request(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async cancelBooking(bookingId: string, cancellationReason?: string) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason }),
    });
  }

  // Payment endpoints
  async createPaymentIntent(amount: number, serviceId?: string, providerId?: string) {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, serviceId, providerId }),
    });
  }

  async confirmPayment(paymentIntentId: string) {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  async getPaymentHistory() {
    return this.request('/payments/history');
  }
}

export const apiClient = new ApiClient();
