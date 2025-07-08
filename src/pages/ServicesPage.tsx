
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { Heart, Search, Filter, MapPin, Clock, DollarSign, Star, Calendar, MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const { user } = useMongoAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Mock data - this would come from your API
  const services = [
    {
      id: 1,
      title: "Deep Tissue Massage",
      description: "Professional deep tissue massage therapy for muscle tension relief and relaxation.",
      price: 80,
      duration: 60,
      category: "massage",
      provider: {
        name: "Sarah Johnson",
        rating: 4.8,
        totalReviews: 156,
        avatar: null,
        location: "Downtown, City Center"
      }
    },
    {
      id: 2,
      title: "Personal Training Session",
      description: "One-on-one fitness training with certified personal trainer. Customized workout plans.",
      price: 60,
      duration: 45,
      category: "fitness",
      provider: {
        name: "Mike Williams",
        rating: 4.9,
        totalReviews: 89,
        avatar: null,
        location: "Westside Gym"
      }
    },
    {
      id: 3,
      title: "Anti-Aging Facial",
      description: "Rejuvenating facial treatment with premium skincare products and techniques.",
      price: 120,
      duration: 75,
      category: "beauty",
      provider: {
        name: "Emma Davis",
        rating: 4.7,
        totalReviews: 203,
        avatar: null,
        location: "Beauty District"
      }
    },
    {
      id: 4,
      title: "Physical Therapy Session",
      description: "Professional physiotherapy for injury recovery and pain management.",
      price: 90,
      duration: 50,
      category: "physiotherapy",
      provider: {
        name: "Dr. James Miller",
        rating: 4.9,
        totalReviews: 134,
        avatar: null,
        location: "Medical Center"
      }
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'massage', label: 'Massage Therapy' },
    { value: 'fitness', label: 'Personal Training' },
    { value: 'beauty', label: 'Beauty Treatments' },
    { value: 'physiotherapy', label: 'Physiotherapy' },
    { value: 'wellness', label: 'Wellness Services' }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              Welcome, {user?.name}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Discover Services</h2>
          <p className="text-gray-600">Find the perfect body service professional for your needs</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm mb-3">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Provider Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={service.provider.avatar} alt={service.provider.name} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {service.provider.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{service.provider.name}</div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span>{service.provider.rating}</span>
                        <span>({service.provider.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Service Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-purple-600" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      <span>${service.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2 text-red-600" />
                    <span>{service.provider.location}</span>
                  </div>

                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 mb-4">
                    {categories.find(cat => cat.value === service.category)?.label}
                  </Badge>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
