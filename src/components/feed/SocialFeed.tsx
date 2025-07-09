
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Star,
  DollarSign,
  Send,
  MoreHorizontal
} from 'lucide-react';

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
  comments: Array<{
    _id: string;
    userId: {
      _id: string;
      name: string;
      photos?: string[];
    };
    comment: string;
    createdAt: string;
  }>;
  providerId: {
    _id: string;
    name: string;
    photos?: string[];
    rating: number;
    totalReviews: number;
    location?: string;
    isVerified: boolean;
  };
  createdAt: string;
  views: number;
}

const SocialFeed = () => {
  const { user } = useMongoAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await apiClient.getPosts({ limit: 20 });
      if (response.success && response.data) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await apiClient.likePost(postId);
      if (response.success) {
        setPosts(prev => prev.map(post => {
          if (post._id === postId) {
            const isLiked = post.likes.includes(user?.id || '');
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(id => id !== user?.id)
                : [...post.likes, user?.id || '']
            };
          }
          return post;
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (postId: string) => {
    const commentText = commentTexts[postId]?.trim();
    if (!commentText) return;

    try {
      const response = await apiClient.addComment(postId, commentText);
      if (response.success && response.data) {
        setPosts(prev => prev.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: response.data
            };
          }
          return post;
        }));
        setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <motion.div
          key={post._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={post.providerId.photos?.[0]} 
                      alt={post.providerId.name} 
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {post.providerId.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {post.providerId.name}
                      </h3>
                      {post.providerId.isVerified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                        <span>{post.providerId.rating}</span>
                        <span className="mx-1">•</span>
                        <span>{post.providerId.totalReviews} reviews</span>
                      </div>
                      {post.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{post.location}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Post Content */}
              <div className="mb-4">
                <h4 className="font-semibold text-lg text-gray-900 mb-2">{post.title}</h4>
                <p className="text-gray-700 mb-3">{post.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {post.serviceCategory}
                  </Badge>
                  {post.price && (
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign className="h-4 w-4" />
                      <span>{post.price}</span>
                    </div>
                  )}
                </div>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Images */}
              {post.images.length > 0 && (
                <div className="mb-4">
                  {post.images.length === 1 ? (
                    <img
                      src={`http://localhost:5000${post.images[0]}`}
                      alt={post.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {post.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`http://localhost:5000${image}`}
                            alt={`${post.title} ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {index === 3 && post.images.length > 4 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold">
                                +{post.images.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-2 ${
                      post.likes.includes(user?.id || '') 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        post.likes.includes(user?.id || '') ? 'fill-current' : ''
                      }`} 
                    />
                    <span>{post.likes.length}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments.length}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-500 hover:text-green-500">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </Button>
                </div>
                
                <span className="text-sm text-gray-500">{post.views} views</span>
              </div>

              {/* Comments Section */}
              {post.comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {post.comments.slice(0, 3).map((comment) => (
                      <div key={comment._id} className="flex items-start space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={comment.userId.photos?.[0]} 
                            alt={comment.userId.name} 
                          />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {comment.userId.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <p className="font-medium text-sm text-gray-900">
                              {comment.userId.name}
                            </p>
                            <p className="text-sm text-gray-700">{comment.comment}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {post.comments.length > 3 && (
                    <button className="text-sm text-purple-600 hover:text-purple-800 mt-2">
                      View all {post.comments.length} comments
                    </button>
                  )}
                </div>
              )}

              {/* Add Comment */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photos?.[0]} alt={user?.name} />
                    <AvatarFallback className="bg-purple-500 text-white text-xs">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentTexts[post._id] || ''}
                      onChange={(e) => setCommentTexts(prev => ({
                        ...prev,
                        [post._id]: e.target.value
                      }))}
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(post._id);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleComment(post._id)}
                      disabled={!commentTexts[post._id]?.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {posts.length === 0 && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Heart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">
              Follow some service providers to see their posts here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialFeed;
