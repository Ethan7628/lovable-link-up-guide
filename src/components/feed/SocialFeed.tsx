
import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { firebaseApiClient } from '@/lib/firebase-api';
import { Heart } from 'lucide-react';
import PostCard from './PostCard';

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
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await firebaseApiClient.getPosts({ limit: 20 });
      if (response.success && response.data) {
        setPosts(response.data as Post[]);
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
      const response = await firebaseApiClient.likePost(postId);
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

  const handleComment = async (postId: string, commentText: string) => {
    try {
      const response = await firebaseApiClient.addComment(postId, commentText);
      if (response.success && response.data) {
        setPosts(prev => prev.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: response.data as Post['comments']
            };
          }
          return post;
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (post: Post) => {
    try {
      const shareUrl = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Post link copied to clipboard",
      });
    } catch (error) {
      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: post.description,
          url: `${window.location.origin}/post/${post._id}`,
        });
      } else {
        toast({
          title: "Share",
          description: "Share functionality not available",
          variant: "destructive",
        });
      }
    }
  };

  const handleFollow = async (providerId: string) => {
    try {
      setFollowingUsers(prev => new Set([...prev, providerId]));
      toast({
        title: "Follow Request Sent",
        description: "Your follow request has been sent to the provider",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send follow request",
        variant: "destructive",
      });
    }
  };

  const handleBook = (post: Post) => {
    toast({
      title: "Booking Service",
      description: `Opening booking for ${post.title}`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 px-4 sm:px-0">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-0">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={user?.id}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onFollow={handleFollow}
          onBook={handleBook}
          followingUsers={followingUsers}
        />
      ))}

      {posts.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Heart className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">
            Follow some service providers to see their posts here
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
