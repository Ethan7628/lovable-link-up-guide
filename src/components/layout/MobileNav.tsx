import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { motion } from 'framer-motion';
import { 
  Home, 
  Heart, 
  User, 
  MessageCircle, 
  Calendar,
  Settings,
  Plus
} from 'lucide-react';

const MobileNav = () => {
  const { user } = useMongoAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Heart, label: 'Feed', path: '/feed' },
    { icon: Plus, label: 'Create', path: '/create', isProvider: true },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: User, label: 'Profile', path: `/profile/${user.id}` }
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.isProvider || user.role === 'provider'
  );

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-bottom z-50 md:hidden"
    >
      <div className="flex items-center justify-around py-2 px-4">
        {filteredNavItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors focus-ring ${
                isActive 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-purple-600' : ''}`} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileNav;