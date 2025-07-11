
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { apiClient } from '@/lib/api';
import { 
  Heart, 
  Sparkles, 
  Users, 
  Star, 
  Shield, 
  Calendar, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  Server,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Database,
  Globe
} from 'lucide-react';

const AuthPage = () => {
  const { signIn, signUp } = useMongoAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Enhanced connection monitoring
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        const response = await apiClient.checkBackendHealth();
        
        if (response.success && response.data) {
          setBackendHealth(response.data);
          const isHealthy = response.data.database?.status === 'connected';
          setConnectionStatus(isHealthy ? 'connected' : 'disconnected');
        } else {
          setConnectionStatus('disconnected');
          setBackendHealth(null);
        }
      } catch (error) {
        console.log('Backend health check failed:', error);
        setConnectionStatus('disconnected');
        setBackendHealth(null);
      }
    };

    // Initial check
    checkConnection();

    // Set up periodic health checks
    intervalId = setInterval(checkConnection, 15000); // Check every 15 seconds

    // Set up real-time connection monitoring
    const handleStatusChange = (status: string) => {
      setConnectionStatus(status as any);
    };

    apiClient.onConnectionStatusChange(handleStatusChange);

    return () => {
      clearInterval(intervalId);
      apiClient.offConnectionStatusChange(handleStatusChange);
    };
  }, []);

  // Sign In form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Sign Up form state
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'buyer' as 'buyer' | 'provider',
    age: '',
    bio: '',
    location: ''
  });

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!signInData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signInData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!signInData.password) {
      newErrors.password = 'Password is required';
    } else if (signInData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      await signIn(signInData.email, signInData.password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!signUpData.name) {
      newErrors.name = 'Full name is required';
    } else if (signUpData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!signUpData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signUpData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!signUpData.password) {
      newErrors.password = 'Password is required';
    } else if (signUpData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!signUpData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(signUpData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (signUpData.age && (parseInt(signUpData.age) < 16 || parseInt(signUpData.age) > 100)) {
      newErrors.age = 'Age must be between 16 and 100';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        ...signUpData,
        age: signUpData.age ? parseInt(signUpData.age) : undefined
      };
      await signUp(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionStatusMessage = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to BodyConnect servers';
      case 'disconnected':
        return 'Cannot connect to servers. Please check your internet connection.';
      case 'checking':
        return 'Checking connection...';
      default:
        return 'Connection status unknown';
    }
  };

  const getConnectionStatusVariant = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'default' as const;
      case 'disconnected':
        return 'destructive' as const;
      case 'checking':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-50"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Enhanced Connection Status Alert */}
        <AnimatePresence mode="wait">
          <motion.div
            key={connectionStatus}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Alert className={`border-2 ${
              connectionStatus === 'connected' 
                ? 'border-green-200 bg-green-50' 
                : connectionStatus === 'disconnected'
                ? 'border-red-200 bg-red-50'
                : 'border-yellow-200 bg-yellow-50'
            }`}>
              {getConnectionStatusIcon()}
              <AlertDescription className={
                connectionStatus === 'connected' 
                  ? 'text-green-800' 
                  : connectionStatus === 'disconnected'
                  ? 'text-red-800'
                  : 'text-yellow-800'
              }>
                <div className="flex items-center justify-between">
                  <span>{getConnectionStatusMessage()}</span>
                  {backendHealth && (
                    <Badge variant={getConnectionStatusVariant()} className="ml-2">
                      {backendHealth.database?.isConnected ? (
                        <><Database className="h-3 w-3 mr-1" /> DB Connected</>
                      ) : (
                        <><Database className="h-3 w-3 mr-1" /> DB Issue</>
                      )}
                    </Badge>
                  )}
                </div>
                {backendHealth && connectionStatus === 'connected' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 text-sm text-green-700"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Server className="h-3 w-3 mr-1" />
                        {backendHealth.environment}
                      </span>
                      <span className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        {backendHealth.uptime ? `${Math.floor(backendHealth.uptime / 60)}m` : 'Active'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        </AnimatePresence>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              BodyConnect
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Connect with trusted body service professionals
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="text-sm font-medium">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInData.email}
                      onChange={(e) => {
                        setSignInData({ ...signInData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`h-11 transition-all duration-200 ${
                        errors.email 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => {
                          setSignInData({ ...signInData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                        className={`h-11 pr-10 transition-all duration-200 ${
                          errors.password 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-white font-medium disabled:opacity-60"
                    disabled={isLoading || connectionStatus === 'disconnected'}
                  >
                    {isLoading ? (
                      <motion.div className="flex items-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing In...
                      </motion.div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                        Full Name
                      </Label>
                      <Input
                        id="signup-name"
                        placeholder="Your full name"
                        value={signUpData.name}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                        className={`h-11 transition-all duration-200 ${
                          errors.name 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                        }`}
                      />
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-600 flex items-center"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.name}
                        </motion.p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-sm font-medium text-gray-700">
                        Phone
                      </Label>
                      <Input
                        id="signup-phone"
                        placeholder="Phone number"
                        value={signUpData.phone}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        className={`h-11 transition-all duration-200 ${
                          errors.phone 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                        }`}
                      />
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-600 flex items-center"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.phone}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpData.email}
                      onChange={(e) => {
                        setSignUpData({ ...signUpData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`h-11 transition-all duration-200 ${
                        errors.email 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignUpPassword ? "text" : "password"}
                        placeholder="Create a password (min 6 characters)"
                        value={signUpData.password}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                        className={`h-11 pr-10 transition-all duration-200 ${
                          errors.password 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-role" className="text-sm font-medium text-gray-700">
                        I am a
                      </Label>
                      <Select
                        value={signUpData.role}
                        onValueChange={(value: 'buyer' | 'provider') => setSignUpData({ ...signUpData, role: value })}
                      >
                        <SelectTrigger className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Client</SelectItem>
                          <SelectItem value="provider">Service Provider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-age" className="text-sm font-medium text-gray-700">
                        Age (Optional)
                      </Label>
                      <Input
                        id="signup-age"
                        type="number"
                        placeholder="Your age"
                        value={signUpData.age}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, age: e.target.value });
                          if (errors.age) setErrors({ ...errors, age: '' });
                        }}
                        className={`h-11 transition-all duration-200 ${
                          errors.age 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                        }`}
                        min="16"
                        max="100"
                      />
                      {errors.age && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-600 flex items-center"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.age}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-location" className="text-sm font-medium text-gray-700">
                      Location (Optional)
                    </Label>
                    <Input
                      id="signup-location"
                      placeholder="City, Country"
                      value={signUpData.location}
                      onChange={(e) => setSignUpData({ ...signUpData, location: e.target.value })}
                      className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-white font-medium disabled:opacity-60"
                    disabled={isLoading || connectionStatus === 'disconnected'}
                  >
                    {isLoading ? (
                      <motion.div className="flex items-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Account...
                      </motion.div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Enhanced feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Verified Professionals</p>
          </motion.div>
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield className="h-6 w-6 text-pink-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Secure Booking</p>
          </motion.div>
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Easy Scheduling</p>
          </motion.div>
        </motion.div>

        {/* Enhanced Backend Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
            {getConnectionStatusIcon()}
            <span>
              {connectionStatus === 'connected' && 'All Systems Operational'}
              {connectionStatus === 'disconnected' && 'Connection Issues'}
              {connectionStatus === 'checking' && 'Checking Status...'}
            </span>
            {backendHealth && connectionStatus === 'connected' && (
              <Badge variant="outline" className="ml-2 text-xs">
                v{backendHealth.version}
              </Badge>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
