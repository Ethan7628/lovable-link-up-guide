
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { Heart, Calendar, Clock, MapPin, Phone, MessageCircle, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingsPage = () => {
  const { user } = useMongoAuth();

  // Mock data - this would come from your API
  const bookings = [
    {
      id: 1,
      service: "Deep Tissue Massage",
      provider: {
        name: "Sarah Johnson",
        avatar: null,
        phone: "+1 (555) 123-4567"
      },
      date: "2024-01-15",
      time: "3:00 PM",
      duration: 60,
      price: 80,
      status: "confirmed",
      location: "Downtown Wellness Center",
      notes: "Focus on shoulders and upper back"
    },
    {
      id: 2,
      service: "Personal Training Session",
      provider: {
        name: "Mike Williams",
        avatar: null,
        phone: "+1 (555) 234-5678"
      },
      date: "2024-01-16",
      time: "10:00 AM",
      duration: 45,
      price: 60,
      status: "pending",
      location: "Westside Gym",
      notes: "Upper body strength training"
    },
    {
      id: 3,
      service: "Anti-Aging Facial",
      provider: {
        name: "Emma Davis",
        avatar: null,
        phone: "+1 (555) 345-6789"
      },
      date: "2024-01-10",
      time: "2:00 PM",
      duration: 75,
      price: 120,
      status: "completed",
      location: "Beauty District Spa",
      notes: "Regular monthly facial"
    },
    {
      id: 4,
      service: "Physical Therapy",
      provider: {
        name: "Dr. James Miller",
        avatar: null,
        phone: "+1 (555) 456-7890"
      },
      date: "2024-01-08",
      time: "11:30 AM",
      duration: 50,
      price: 90,
      status: "cancelled",
      location: "Medical Center",
      notes: "Knee injury follow-up"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  );
  
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  );

  const BookingCard = ({ booking, isPast = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                {booking.service}
              </CardTitle>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getStatusColor(booking.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(booking.status)}
                    <span className="capitalize">{booking.status}</span>
                  </div>
                </Badge>
                <span className="text-lg font-semibold text-purple-600">
                  ${booking.price}
                </span>
              </div>
            </div>
          </div>
          
          {/* Provider Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={booking.provider.avatar} alt={booking.provider.name} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {booking.provider.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{booking.provider.name}</div>
              <div className="text-sm text-gray-600">{booking.provider.phone}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Booking Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-3 text-purple-600" />
              <span>{new Date(booking.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-3 text-blue-600" />
              <span>{booking.time} ({booking.duration} minutes)</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-3 text-red-600" />
              <span>{booking.location}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Notes:</strong> {booking.notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {!isPast && booking.status === 'confirmed' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Cancel
                </Button>
              </>
            )}
            
            {!isPast && booking.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Cancel
                </Button>
              </>
            )}
            
            {isPast && booking.status === 'completed' && (
              <>
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="sm"
                >
                  Leave Review
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  Book Again
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center text-purple-600 hover:text-purple-700">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-purple-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BodyConnect
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              My Bookings
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h2>
          <p className="text-gray-600">Manage your appointments and service bookings</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upcoming" className="text-base">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="text-base">
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center py-12"
              >
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                <p className="text-gray-600 mb-6">Ready to book your next service?</p>
                <Link to="/services">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Browse Services
                  </Button>
                </Link>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPast />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center py-12"
              >
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No past bookings</h3>
                <p className="text-gray-600">Your booking history will appear here</p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BookingsPage;
