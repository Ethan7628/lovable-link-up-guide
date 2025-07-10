
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  MapPin,
  Star,
  CheckCircle,
  Send,
  Calendar,
  UserPlus,
  Eye
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (post: Post) => void;
  onFollow: (providerId: string) => void;
  onBook: (post: Post) => void;
  followingUsers: Set<string>;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onFollow,
  onBook,
  followingUsers
}) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const isLiked = post.likes.includes(currentUserId || '');
  const isFollowing = followingUsers.has(post.providerId._id);

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={post.providerId.photos?.[0]} 
              alt={post.providerId.name} 
            />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
              {post.providerId.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm">{post.providerId.name}</span>
              {post.providerId.isVerified && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500 space-x-1">
              {post.location && (
                <>
                  <MapPin className="h-3 w-3" />
                  <span>{post.location}</span>
                  <span>•</span>
                </>
              )}
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isFollowing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFollow(post.providerId._id)}
              className="text-xs px-3 py-1"
            >
              Follow
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="relative">
          {post.images.length === 1 ? (
            <img
              src={`http://localhost:5000${post.images[0]}`}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {post.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <img
                      src={`http://localhost:5000${image}`}
                      alt={`${post.title} ${index + 1}`}
                      className="w-full h-96 object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post._id)}
              className="p-0 h-auto"
            >
              <Heart 
                className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-900'}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="p-0 h-auto"
            >
              <MessageCircle className="h-6 w-6 text-gray-900" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(post)}
              className="p-0 h-auto"
            >
              <Share2 className="h-6 w-6 text-gray-900" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="p-0 h-auto"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-6 w-6 text-gray-900" />
            ) : (
              <Bookmark className="h-6 w-6 text-gray-900" />
            )}
          </Button>
        </div>

        {/* Likes count */}
        {post.likes.length > 0 && (
          <div className="font-semibold text-sm mb-2">
            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
          </div>
        )}

        {/* Caption */}
        <div className="mb-2">
          <span className="font-semibold text-sm mr-2">{post.providerId.name}</span>
          <span className="text-sm">
            {showDescription ? post.description : truncateText(post.description, 100)}
            {post.description.length > 100 && (
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="text-gray-500 ml-1"
              >
                {showDescription ? 'less' : 'more'}
              </button>
            )}
          </span>
        </div>

        {/* Service details */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {post.serviceCategory}
            </Badge>
            {post.price && (
              <span className="text-green-600 font-semibold text-sm">
                ${post.price}
              </span>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Eye className="h-3 w-3 mr-1" />
            {post.views}
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-blue-600 text-sm mr-2">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Book service button */}
        <Button
          onClick={() => onBook(post)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white mb-3"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Book Service
        </Button>

        {/* Comments preview */}
        {post.comments.length > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-gray-500 text-sm mb-2 block"
          >
            View all {post.comments.length} comments
          </button>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex items-start space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={comment.userId.photos?.[0]} />
                  <AvatarFallback className="text-xs">
                    {comment.userId.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <span className="font-semibold text-sm mr-2">{comment.userId.name}</span>
                  <span className="text-sm">{comment.comment}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        <div className="flex items-center space-x-2 border-t pt-3">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-purple-500 text-white">
              {currentUserId?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleComment();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleComment}
            disabled={!commentText.trim()}
            variant="ghost"
            className="p-1"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
