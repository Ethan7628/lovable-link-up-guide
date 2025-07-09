
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { 
  Heart, 
  MessageSquare, 
  Calendar, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign,
  Settings,
  BookOpen,
  Search,
  MapPin,
  Clock,
  Award,
  Menu,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut } = useMongoAuth();

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

  const quickActions = [
    { name: 'Browse Services', icon: Search, href: '/services', color: 'bg-blue-500' },
    { name: 'Messages', icon: MessageSquare, href: '/chat', color: 'bg-green-500' },
    { name: 'My Bookings', icon: Calendar, href: '/bookings', color: 'bg-purple-500' },
    { name: 'Reviews', icon: Star, href: '/reviews', color: 'bg-yellow-500' },
    { name: 'Settings', icon: Settings, href: '/settings', color: 'bg-gray-500' },
  ];

  const recentBookings = [
    {
      id: 1,
      serviceName: 'Deep Tissue Massage',
      providerName: 'Sarah Johnson',
      date: '2024-01-20',
      time: '2:00 PM',
      status: 'confirmed',
      avatar: null
    },
    {
      id: 2,
      serviceName: 'Personal Training',
      providerName: 'Mike Williams',
      date: '2024-01-22',
      time: '10:00 AM',
      status: 'pending',
      avatar: null
    },
    {
      id: 3,
      serviceName: 'Facial Treatment',
      providerName: 'Emma Davis',
      date: '2024-01-25',
      time: '3:30 PM',
      status: 'confirmed',
      avatar: null
    }
  ];

  const stats = [
    { label: 'Total Bookings', value: '12', icon: Calendar, change: '+2 this month' },
    { label: 'Favorite Providers', value: '5', icon: Heart, change: '+1 this month' },
    { label: 'Reviews Given', value: '8', icon: Star, change: '+3 this month' },
    { label: 'Messages', value: '24', icon: MessageSquare, change: '+12 today' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                BodyConnect
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  Welcome, {user?.name || 'User'}!
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={signOut}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
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
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      Welcome back, {user?.name || 'User'}!
                    </h2>
                    <p className="text-purple-100 text-lg">
                      Ready to discover amazing body services today?
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-6xl opacity-20">🌟</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.name}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to={action.href}>
                    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">{action.name}</h4>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                          <stat.icon className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Bookings */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Recent Bookings</h3>
              <Link to="/bookings">
                <Button variant="outline" className="flex items-center gap-2">
                  View All
                  <Calendar className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={booking.avatar} alt={booking.providerName} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {booking.providerName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{booking.serviceName}</h4>
                            <p className="text-sm text-gray-600">with {booking.providerName}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(booking.date).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {booking.time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                            className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
