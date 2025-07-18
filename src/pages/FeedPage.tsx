import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SocialFeed from '@/components/feed/SocialFeed';
const FeedPage = () => {
  const {
    user
  } = useMongoAuth();
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 pt-16">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-purple-100 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0 py-0">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold text-gray-900">Community Feed</CardTitle>
              <p className="text-gray-600">Discover services and connect with providers</p>
            </CardHeader>
            <CardContent className="p-0">
              <SocialFeed />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>;
};
export default FeedPage;