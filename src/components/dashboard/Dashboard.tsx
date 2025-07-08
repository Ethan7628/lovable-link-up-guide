
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { Heart, MapPin, Phone, Mail, User, Star, Calendar, Settings, LogOut, MessageCircle, Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut } = useMongoAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Heart className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                BodyConnect
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Profile Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24 ring-4 ring-purple-200">
                    <AvatarImage src={user.photos?.[0]} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {user.name}
                </CardTitle>
                <div className="flex justify-center mt-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {user.role === 'buyer' ? 'Client' : user.role === 'provider' ? 'Service Provider' : 'Admin'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-purple-600" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-3 text-purple-600" />
                  <span className="text-sm">{user.phone}</span>
                </div>
                {user.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-3 text-purple-600" />
                    <span className="text-sm">{user.location}</span>
                  </div>
                )}
                {user.age && (
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-3 text-purple-600" />
                    <span className="text-sm">{user.age} years old</span>
                  </div>
                )}
                {user.rating && user.rating > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Star className="h-4 w-4 mr-3 text-yellow-500 fill-current" />
                    <span className="text-sm">{user.rating} ({user.totalReviews} reviews)</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="space-y-6">
              {/* Welcome Card */}
              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome back, {user.name}!</CardTitle>
                  <CardDescription className="text-purple-100">
                    {user.role === 'provider' 
                      ? "Manage your services and connect with clients on BodyConnect"
                      : "Discover amazing body services and connect with professionals"
                    }
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Access your most used features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/services">
                      <Button 
                        variant="outline" 
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
                      >
                        <Search className="h-6 w-6 text-purple-600" />
                        <span className="text-sm">Browse Services</span>
                      </Button>
                    </Link>
                    
                    <Link to="/bookings">
                      <Button 
                        variant="outline" 
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-pink-50 hover:border-pink-300"
                      >
                        <Calendar className="h-6 w-6 text-pink-600" />
                        <span className="text-sm">My Bookings</span>
                      </Button>
                    </Link>
                    
                    <Link to="/chat">
                      <Button 
                        variant="outline" 
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-rose-50 hover:border-rose-300"
                      >
                        <MessageCircle className="h-6 w-6 text-rose-600" />
                        <span className="text-sm">Messages</span>
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-300"
                    >
                      <BookOpen className="h-6 w-6 text-orange-600" />
                      <span className="text-sm">Reviews</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {user.role === 'provider' ? 'Services' : 'Bookings'}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {user.role === 'provider' ? (user.services?.length || 0) : 0}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Rating</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {user.rating?.toFixed(1) || '0.0'}
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Star className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {user.role === 'provider' && (
                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Earnings</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${user.earnings?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <span className="text-green-600 font-bold text-lg">$</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Bio Section */}
              {user.bio && (
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Services Section for Providers */}
              {user.role === 'provider' && user.services && user.services.length > 0 && (
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>My Services</CardTitle>
                    <CardDescription>Services you offer to clients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.services.map((service, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-semibold text-gray-900">{service.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <Badge variant="outline">{service.category}</Badge>
                            <span className="font-semibold text-purple-600">${service.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
