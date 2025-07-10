import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import CreatePost from '@/components/posts/CreatePost';
import { 
  Heart, 
  ArrowLeft, 
  User, 
  Settings, 
  Plus,
  Calendar,
  DollarSign,
  Star,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Share2,
  MessageCircle,
  MapPin,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Post {
  _id: string;
  title: string;
  description: string;
  images: string[];
  serviceCategory: string;
  price: number;
  location: string;
  tags: string[];
  likes: string[];
  views: number;
  comments: any[];
  createdAt: string;
  providerId: {
    _id: string;
    name: string;
    photos: string[];
    profilePicture?: string;
  };
}

interface Booking {
  _id: string;
  status: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  totalAmount: number;
  notes?: string;
  buyerId: {
    _id: string;
    name: string;
    phone: string;
    profilePicture?: string;
  };
  serviceId: {
    _id: string;
    title: string;
    description: string;
    category: string;
  };
  createdAt: string;
}

const Dashboard = () => {
  const { user, signOut } = useMongoAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (user?.role === 'provider') {
      fetchMyPosts();
      fetchProviderBookings();
    } else if (user?.role === 'buyer') {
      fetchMyBookings();
    }
  }, [user]);

  const fetchMyPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await apiClient.getMyPosts();
      if (response.success) {
        setPosts((response.data as Post[]) || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchProviderBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await apiClient.getProviderBookings();
      if (response.success) {
        setBookings((response.data as Booking[]) || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await apiClient.getBookings();
      if (response.success) {
        setBookings((response.data as Booking[]) || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleBookingAction = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const response = await apiClient.updateBookingStatus(bookingId, status);
      if (response.success) {
        toast({
          title: `Booking ${status}`,
          description: `The booking has been ${status} successfully.`,
        });
        fetchProviderBookings();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await apiClient.deletePost(postId);
        if (response.success) {
          toast({
            title: "Post deleted",
            description: "Your post has been deleted successfully.",
          });
          fetchMyPosts();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete post",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = {
    totalEarnings: user?.earnings || 0,
    totalBookings: bookings.length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    totalPosts: posts.length,
    totalViews: posts.reduce((sum, post) => sum + post.views, 0),
    totalLikes: posts.reduce((sum, post) => sum + post.likes.length, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-purple-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BodyConnect
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/feed" className="text-purple-600 hover:text-purple-700 transition-colors">
                Social Feed
              </Link>
              <Link to="/settings" className="flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                <Settings className="h-5 w-5 mr-1" />
                Settings
              </Link>
              <button 
                onClick={signOut}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-4 border-purple-200">
                  <AvatarImage src={user?.profilePicture || ""} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.name}!
                  </h2>
                  <p className="text-gray-600">
                    {user?.role === 'provider' ? 'Manage your services and bookings' : 'Manage your bookings and find services'}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {user?.role === 'buyer' ? 'Client' : 'Service Provider'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {user?.role === 'provider' ? (
              <>
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                        <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Eye className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Post Views</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Heart className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Likes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">My Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-white/95 backdrop-blur-sm rounded-lg p-1">
            {user?.role === 'provider' ? (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'bookings' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Bookings
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'posts' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Posts
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'create' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Create Post
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'bookings' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Bookings
                </button>
              </>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {user?.role === 'provider' ? 'Provider Dashboard' : 'Client Dashboard'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {user?.role === 'provider' 
                    ? 'Manage your services, track bookings, and connect with clients.'
                    : 'Browse services, manage your bookings, and connect with providers.'
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/feed" className="block">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 flex items-center">
                        <MessageSquare className="h-8 w-8 text-purple-600 mr-4" />
                        <div>
                          <h3 className="font-semibold">Social Feed</h3>
                          <p className="text-sm text-gray-600">Browse and interact with posts</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/settings" className="block">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 flex items-center">
                        <Settings className="h-8 w-8 text-purple-600 mr-4" />
                        <div>
                          <h3 className="font-semibold">Settings</h3>
                          <p className="text-sm text-gray-600">Manage your account</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'bookings' && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {user?.role === 'provider' ? 'Booking Requests' : 'My Bookings'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBookings ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No bookings found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatDate(booking.createdAt)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg">{booking.serviceId.title}</h3>
                            <p className="text-gray-600 mb-2">{booking.serviceId.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Date & Time</p>
                                <p className="font-medium">
                                  {formatDate(booking.bookingDate)} at {booking.startTime} - {booking.endTime}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">
                                  {user?.role === 'provider' ? 'Client' : 'Provider'}
                                </p>
                                <p className="font-medium">
                                  {user?.role === 'provider' ? booking.buyerId.name : booking.serviceId.title}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Venue</p>
                                <p className="font-medium">{booking.venue}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Amount</p>
                                <p className="font-medium">${booking.totalAmount}</p>
                              </div>
                            </div>
                            {booking.notes && (
                              <div className="mt-2">
                                <p className="text-gray-500 text-sm">Notes</p>
                                <p className="text-sm">{booking.notes}</p>
                              </div>
                            )}
                          </div>
                          {user?.role === 'provider' && booking.status === 'pending' && (
                            <div className="ml-4 space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleBookingAction(booking._id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBookingAction(booking._id, 'cancelled')}
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'posts' && user?.role === 'provider' && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">My Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPosts ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No posts found</p>
                    <p className="text-sm text-gray-500 mt-2">Create your first post to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                      <div key={post._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {post.images.length > 0 && (
                          <img
                            src={`http://localhost:5000${post.images[0]}`}
                            alt={post.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{post.title}</h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePost(post._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{post.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                            <Badge variant="secondary">{post.serviceCategory}</Badge>
                            <span className="font-semibold text-green-600">${post.price}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                {post.likes.length}
                              </span>
                              <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {post.views}
                              </span>
                              <span className="flex items-center">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {post.comments.length}
                              </span>
                            </div>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {post.location}
                            </span>
                          </div>
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'create' && user?.role === 'provider' && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Create New Post</CardTitle>
              </CardHeader>
              <CardContent>
                <CreatePost onPostCreated={fetchMyPosts} />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
