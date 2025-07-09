
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import SocialFeed from '@/components/feed/SocialFeed';
import CreatePost from '@/components/posts/CreatePost';
import { 
  Heart, 
  MessageSquare, 
  Calendar, 
  Star, 
  Settings, 
  User, 
  DollarSign,
  TrendingUp,
  Users,
  BookOpen,
  Camera,
  Plus,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useMongoAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user && isMobile) {
      toast({
        title: `Welcome back, ${user.name}!`,
        description: "Great to see you again",
      });
    }
  }, [user, isMobile, toast]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const stats = [
    { 
      title: 'Total Bookings', 
      value: '12', 
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Reviews', 
      value: '4.8', 
      icon: <Star className="h-5 w-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    { 
      title: 'Messages', 
      value: '8', 
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Earnings', 
      value: '$280', 
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const quickActions = [
    { 
      title: 'Create Post', 
      icon: <Camera className="h-5 w-5" />, 
      action: () => {}, 
      color: 'bg-purple-600 hover:bg-purple-700' 
    },
    { 
      title: 'View Messages', 
      icon: <MessageSquare className="h-5 w-5" />, 
      action: () => navigate('/chat'), 
      color: 'bg-blue-600 hover:bg-blue-700' 
    },
    { 
      title: 'My Bookings', 
      icon: <Calendar className="h-5 w-5" />, 
      action: () => navigate('/bookings'), 
      color: 'bg-green-600 hover:bg-green-700' 
    },
    { 
      title: 'Settings', 
      icon: <Settings className="h-5 w-5" />, 
      action: () => navigate('/settings'), 
      color: 'bg-gray-600 hover:bg-gray-700' 
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 prevent-overflow">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2" />
              <span className="font-bold text-lg sm:text-xl text-gray-900">BodyConnect</span>
            </div>
            
            {/* Desktop Welcome Message */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Welcome back,</p>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile User Avatar */}
            {isMobile && (
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="p-2"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-4 py-2"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`${stat.bgColor} ${stat.color} p-2 sm:p-3 rounded-full`}>
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.action}
                      className={`${action.color} text-white p-3 sm:p-4 h-auto flex flex-col items-center space-y-1 sm:space-y-2 hover:scale-105 transition-all duration-200`}
                    >
                      {action.icon}
                      <span className="text-xs sm:text-sm font-medium">{action.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Feed */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Recent Posts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <SocialFeed />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {user.role === 'provider' ? 'Service Provider' : 'Client'}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/settings')}
                  className="w-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Create Post Card (for providers) */}
            {user.role === 'provider' && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">Share Update</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreatePost />
                </CardContent>
              </Card>
            )}

            {/* Navigation Links */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Navigate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/services')}
                  className="w-full justify-start"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Services
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/chat')}
                  className="w-full justify-start"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/bookings')}
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Bookings
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/reviews')}
                  className="w-full justify-start"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Reviews
                </Button>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">New booking request</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Message from client</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Profile view</span>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-purple-600 hover:text-purple-700">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
