
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  ArrowLeft, 
  Star, 
  ThumbsUp, 
  MessageSquare,
  Filter,
  Search,
  Plus,
  Calendar,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewsPage = () => {
  const { user } = useMongoAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    serviceId: '',
    providerId: ''
  });

  // Mock data - would come from API
  const myReviews = [
    {
      id: 1,
      providerName: "Sarah Johnson",
      providerAvatar: null,
      serviceName: "Deep Tissue Massage",
      rating: 5,
      comment: "Amazing experience! Sarah was very professional and the massage was exactly what I needed. Highly recommend!",
      date: "2024-01-15",
      helpful: 12,
      providerResponse: "Thank you so much for the wonderful review! It was a pleasure working with you."
    },
    {
      id: 2,
      providerName: "Mike Williams",
      providerAvatar: null,
      serviceName: "Personal Training Session",
      rating: 4,
      comment: "Great workout session. Mike pushed me to achieve my goals and provided excellent guidance.",
      date: "2024-01-10",
      helpful: 8,
      providerResponse: null
    },
    {
      id: 3,
      providerName: "Emma Davis",
      providerAvatar: null,
      serviceName: "Facial Treatment",
      rating: 5,
      comment: "Incredible facial treatment! My skin feels amazing and Emma was so knowledgeable about skincare.",
      date: "2024-01-05",
      helpful: 15,
      providerResponse: "So happy you loved the treatment! Looking forward to your next visit."
    }
  ];

  const receivedReviews = [
    {
      id: 1,
      clientName: "John Doe",
      clientAvatar: null,
      serviceName: "Yoga Session",
      rating: 5,
      comment: "Excellent instructor! Very patient and knowledgeable. Will definitely book again.",
      date: "2024-01-12",
      helpful: 5,
      responded: true
    },
    {
      id: 2,
      clientName: "Jane Smith",
      clientAvatar: null,
      serviceName: "Massage Therapy",
      rating: 4,
      comment: "Good service overall. The therapist was professional and the environment was relaxing.",
      date: "2024-01-08",
      helpful: 3,
      responded: false
    }
  ];

  const allReviews = [
    ...myReviews.map(r => ({ ...r, type: 'given' })),
    ...receivedReviews.map(r => ({ ...r, type: 'received' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredReviews = allReviews.filter(review => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      review.providerName?.toLowerCase().includes(searchTerm) ||
      review.clientName?.toLowerCase().includes(searchTerm) ||
      review.serviceName.toLowerCase().includes(searchTerm) ||
      review.comment.toLowerCase().includes(searchTerm)
    );
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleSubmitReview = async () => {
    try {
      // API call to submit review would go here
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully.",
      });
      setNewReview({
        rating: 5,
        comment: '',
        serviceId: '',
        providerId: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center text-purple-600 hover:text-purple-700 transition-colors">
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
            <div className="flex items-center space-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Write Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 cursor-pointer transition-colors ${
                              i < newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                            onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comment">Comment</Label>
                      <Textarea
                        id="comment"
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="Share your experience..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleSubmitReview} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                      Submit Review
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Reviews</TabsTrigger>
              <TabsTrigger value="given">Reviews Given</TabsTrigger>
              <TabsTrigger value="received">Reviews Received</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            {/* All Reviews Tab */}
            <TabsContent value="all">
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <motion.div
                    key={`${review.type}-${review.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={review.providerAvatar || review.clientAvatar} 
                              alt={review.providerName || review.clientName} 
                            />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {(review.providerName || review.clientName).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {review.providerName || review.clientName}
                                </h3>
                                <p className="text-sm text-gray-600">{review.serviceName}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={review.type === 'given' ? 'default' : 'secondary'}>
                                  {review.type === 'given' ? 'Given' : 'Received'}
                                </Badge>
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {review.helpful} helpful
                                </span>
                              </div>
                              {review.type === 'received' && !review.responded && (
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Respond
                                </Button>
                              )}
                            </div>
                            {(review.providerResponse || review.type === 'received') && review.responded && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 mb-1">Response:</p>
                                <p className="text-sm text-gray-700">
                                  {review.providerResponse || "Thank you for your feedback!"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Reviews Given Tab */}
            <TabsContent value="given">
              <div className="space-y-4">
                {myReviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={review.providerAvatar} alt={review.providerName} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {review.providerName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{review.providerName}</h3>
                                <p className="text-sm text-gray-600">{review.serviceName}</p>
                              </div>
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                {review.helpful} helpful
                              </span>
                            </div>
                            {review.providerResponse && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 mb-1">Provider Response:</p>
                                <p className="text-sm text-gray-700">{review.providerResponse}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Reviews Received Tab */}
            <TabsContent value="received">
              <div className="space-y-4">
                {receivedReviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={review.clientAvatar} alt={review.clientName} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {review.clientName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{review.clientName}</h3>
                                <p className="text-sm text-gray-600">{review.serviceName}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                                {!review.responded && (
                                  <Badge variant="outline" className="text-orange-600">
                                    Needs Response
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                              {!review.responded && (
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Respond
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">4.8</div>
                      <div className="flex justify-center mb-2">
                        {renderStars(5)}
                      </div>
                      <p className="text-sm text-gray-600">Based on 15 reviews</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Reviews Given</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{myReviews.length}</div>
                      <p className="text-sm text-gray-600">Total reviews written</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Reviews Received</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{receivedReviews.length}</div>
                      <p className="text-sm text-gray-600">Total reviews received</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewsPage;
