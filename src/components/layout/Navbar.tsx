
import React, { useState, useEffect } from 'react';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  LogOut, 
  User, 
  Settings, 
  Bell, 
  Heart, 
  Wifi, 
  WifiOff, 
  Menu,
  X,
  Home,
  MessageCircle,
  Calendar,
  Star,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { apiClient } from '@/lib/api';

const Navbar = () => {
  const { user, signOut } = useMongoAuth();
  const location = useLocation();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [notificationCount, setNotificationCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Monitor connection status
  useEffect(() => {
    const handleStatusChange = (status: string) => {
      setConnectionStatus(status as any);
    };

    // Set initial status
    setConnectionStatus(apiClient.getConnectionStatus() as any);
    
    // Listen for changes
    apiClient.onConnectionStatusChange(handleStatusChange);

    return () => {
      apiClient.offConnectionStatusChange(handleStatusChange);
    };
  }, []);

  // Get API base URL with environment awareness
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Build URL based on environment
    const baseUrl = import.meta.env.PROD 
      ? 'https://bodyconnect-backend.vercel.app' 
      : 'http://localhost:5000';
    
    return `${baseUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/feed', label: 'Feed', icon: Heart },
    { path: '/chat', label: 'Messages', icon: MessageCircle },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/services', label: 'Services', icon: Star },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const ConnectionIndicator = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-2"
    >
      {connectionStatus === 'connected' ? (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="h-3 w-3" />
          <span className="text-xs font-medium hidden sm:inline">Online</span>
        </div>
      ) : connectionStatus === 'disconnected' ? (
        <div className="flex items-center gap-1 text-red-600">
          <WifiOff className="h-3 w-3" />
          <span className="text-xs font-medium hidden sm:inline">Offline</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-yellow-600">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-3 w-3 border border-current border-t-transparent rounded-full"
          />
          <span className="text-xs font-medium hidden sm:inline">Checking</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    BodyConnect
                  </h1>
                  <ConnectionIndicator />
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {user && navigationItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={isActivePath(item.path) ? "default" : "ghost"}
                      size="sm"
                      className={`flex items-center gap-2 transition-all duration-200 ${
                        isActivePath(item.path)
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </Button>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Connection Status (Mobile) */}
              <div className="sm:hidden">
                <ConnectionIndicator />
              </div>

              {user ? (
                <div className="flex items-center gap-3">
                  {/* Notifications */}
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                    >
                      <Bell className="h-5 w-5 text-gray-600" />
                      <AnimatePresence>
                        {notificationCount > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                          >
                            {notificationCount > 9 ? '9+' : notificationCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full transition-all duration-200">
                          <Avatar className="h-10 w-10 ring-2 ring-gray-200 hover:ring-purple-300 transition-all duration-200">
                            <AvatarImage
                              src={getImageUrl(user.profilePicture || user.photos?.[0] || '')}
                              alt={user.name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white font-semibold">
                              {user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {user.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                              <span className="sr-only">Verified</span>
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-2 shadow-xl" align="end" forceMount>
                      <DropdownMenuLabel className="p-0">
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg mb-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={getImageUrl(user.profilePicture || user.photos?.[0] || '')}
                              alt={user.name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                              {user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.name}
                              </p>
                              {user.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 capitalize">
                              {user.role === 'buyer' ? 'Client' : 'Service Provider'}
                            </p>
                            {user.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-gray-600">
                                  {user.rating.toFixed(1)} ({user.totalReviews || 0} reviews)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors">
                        <Link to={`/profile/${user.id}`}>
                          <User className="mr-3 h-4 w-4" />
                          <span>View Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors">
                        <Link to="/settings">
                          <Settings className="mr-3 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>

                      {user.role === 'provider' && (
                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors">
                          <Link to="/reviews">
                            <Star className="mr-3 h-4 w-4" />
                            <span>My Reviews</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors">
                        <Link to="/bookings">
                          <CreditCard className="mr-3 h-4 w-4" />
                          <span>Payments</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors">
                        <HelpCircle className="mr-3 h-4 w-4" />
                        <span>Help & Support</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="cursor-pointer hover:bg-red-50 text-red-600 rounded-md p-2 transition-colors"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Mobile Menu Button */}
                  <div className="md:hidden">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        {isMobileMenuOpen ? (
                          <X className="h-5 w-5 text-gray-600" />
                        ) : (
                          <Menu className="h-5 w-5 text-gray-600" />
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/auth">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost" className="transition-all duration-200">
                        Sign In
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/auth">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg">
                        Get Started
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md"
            >
              <div className="px-4 py-3 space-y-2">
                {navigationItems.map((item) => (
                  <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={isActivePath(item.path) ? "default" : "ghost"}
                        className={`w-full justify-start gap-3 transition-all duration-200 ${
                          isActivePath(item.path)
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
