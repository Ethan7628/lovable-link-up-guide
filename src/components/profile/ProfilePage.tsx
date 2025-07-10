
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { apiClient } from '@/lib/api';
import { 
  Heart, 
  ArrowLeft, 
  Settings, 
  Grid3X3, 
  Bookmark, 
  User,
  MapPin,
  Star,
  CheckCircle,
  Calendar,
  Users,
  MessageCircle,
  Share2,
  Eye
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface Post {
  _id: string;
  title: string;
  description: string;
  images: string[];
  serviceCategory: string;
  price?: number;
  location?: string;
  tags: string[];
  likes: string[];
  comments: any[];
  createdAt: string;
  views: number;
}

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  bio: string;
  photos: string[];
  location?: string;
  role: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  services: any[];
}

const ProfilePage = () => {
  const { user } = useMongoAuth();
  const { userId } = useParams();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    fetchProfileData();
    fetchUserPosts();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      if (isOwnProfile && user) {
        // Convert user data to ProfileData format
        const convertedProfile: ProfileData = {
          _id: user.id || '',
          name: user.name || '',
          email: user.email || '',
          bio: user.bio || '',
          photos: user.photos || [],
          location: user.location || '',
          role: user.role || 'buyer',
          isVerified: user.isVerified || false,
          rating: user.rating || 0,
          totalReviews: user.totalReviews || 0,
          services: user.services || []
        };
        setProfileData(convertedProfile);
      } else {
        // Fetch other user's profile - would need API implementation
        if (user) {
          const convertedProfile: ProfileData = {
            _id: user.id || '',
            name: user.name || '',
            email: user.email || '',
            bio: user.bio || '',
            photos: user.photos || [],
            location: user.location || '',
            role: user.role || 'buyer',
            isVerified: user.isVerified || false,
            rating: user.rating || 0,
            totalReviews: user.totalReviews || 0,
            services: user.services || []
          };
          setProfileData(convertedProfile);
        }
      }
      
      // Mock follower data
      setFollowerCount(Math.floor(Math.random() * 1000));
      setFollowingCount(Math.floor(Math.random() * 500));
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await apiClient.getMyPosts();
      if (response.success) {
        setPosts((response.data as Post[]) || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <Link to="/dashboard" className="text-purple-600 hover:text-purple-700">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 pt-16">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-purple-100 sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                {profileData.name}
              </h1>
            </div>
            {isOwnProfile && (
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
              {/* Profile Picture */}
              <Avatar className="h-32 w-32 mx-auto md:mx-0">
                <AvatarImage 
                  src={profileData.photos?.[0] ? `http://localhost:5000${profileData.photos[0]}` : ""} 
                  alt={profileData.name} 
                />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-4xl">
                  {profileData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                  <div className="flex items-center justify-center md:justify-start space-x-2 mb-2 md:mb-0">
                    <h2 className="text-2xl font-semibold">{profileData.name}</h2>
                    {profileData.isVerified && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  
                  {!isOwnProfile && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleFollow}
                        variant={isFollowing ? "outline" : "default"}
                        className={isFollowing ? "" : "bg-purple-600 hover:bg-purple-700"}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                      <Button variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex justify-center md:justify-start space-x-8 mb-4">
                  <div className="text-center">
                    <div className="font-semibold text-lg">{posts.length}</div>
                    <div className="text-gray-600 text-sm">posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{followerCount}</div>
                    <div className="text-gray-600 text-sm">followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{followingCount}</div>
                    <div className="text-gray-600 text-sm">following</div>
                  </div>
                </div>

                {/* Bio and Details */}
                <div className="space-y-2">
                  {profileData.bio && (
                    <p className="text-gray-700">{profileData.bio}</p>
                  )}
                  
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-sm text-gray-600">
                    {profileData.location && (
                      <div className="flex items-center justify-center md:justify-start">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                    
                    {profileData.role === 'provider' && (
                      <div className="flex items-center justify-center md:justify-start">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        <span>{profileData.rating} ({profileData.totalReviews} reviews)</span>
                      </div>
                    )}
                    
                    <Badge variant="secondary">
                      {profileData.role === 'provider' ? 'Service Provider' : 'Client'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="posts" className="flex items-center space-x-2">
                <Grid3X3 className="h-4 w-4" />
                <span>Posts</span>
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="saved" className="flex items-center space-x-2">
                  <Bookmark className="h-4 w-4" />
                  <span>Saved</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="about" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>About</span>
              </TabsTrigger>
            </TabsList>

            {/* Posts Grid */}
            <TabsContent value="posts">
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map((post) => (
                    <motion.div
                      key={post._id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer group"
                    >
                      {post.images.length > 0 ? (
                        <div className="relative aspect-square">
                          <img
                            src={`http://localhost:5000${post.images[0]}`}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-4 text-white">
                              <div className="flex items-center">
                                <Heart className="h-5 w-5 mr-1" />
                                <span>{post.likes.length}</span>
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="h-5 w-5 mr-1" />
                                <span>{post.comments.length}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <div className="text-center p-4">
                            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                            <p className="text-gray-600 text-sm">{post.description.substring(0, 100)}...</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Grid3X3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? "Share your first post!" : "No posts to show"}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Saved Posts */}
            {isOwnProfile && (
              <TabsContent value="saved">
                <div className="text-center py-12">
                  <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No saved posts</h3>
                  <p className="text-gray-600">Posts you save will appear here</p>
                </div>
              </TabsContent>
            )}

            {/* About */}
            <TabsContent value="about">
              <div className="bg-white rounded-lg p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">About</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{profileData.email}</span>
                    </div>
                    {profileData.location && (
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-700">{profileData.location}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">Joined BodyConnect</span>
                    </div>
                  </div>
                </div>

                {profileData.role === 'provider' && profileData.services.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.services.map((service, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">{service.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-green-600 font-semibold">${service.price}</span>
                              <span className="text-sm text-gray-500">{service.duration} min</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
