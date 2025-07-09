
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { Heart, Send, Search, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatPage = () => {
  const { user } = useMongoAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Mock data - this would come from your API and WebSocket connection
  const chats = [
    {
      id: 1,
      name: "Sarah Johnson",
      lastMessage: "Thank you for booking! Looking forward to our session tomorrow.",
      timestamp: "2 min ago",
      unread: 2,
      avatar: null,
      online: true,
      type: "provider"
    },
    {
      id: 2,
      name: "Mike Williams",
      lastMessage: "Let's schedule your next training session.",
      timestamp: "1 hour ago",
      unread: 0,
      avatar: null,
      online: false,
      type: "provider"
    },
    {
      id: 3,
      name: "Emma Davis",
      lastMessage: "Your facial appointment is confirmed for Friday at 2 PM.",
      timestamp: "Yesterday",
      unread: 1,
      avatar: null,
      online: true,
      type: "provider"
    }
  ];

  const messages = [
    {
      id: 1,
      senderId: 1,
      senderName: "Sarah Johnson",
      content: "Hi! I received your booking request for tomorrow at 3 PM.",
      timestamp: "10:30 AM",
      isOwn: false
    },
    {
      id: 2,
      senderId: user?.id,
      senderName: user?.name,
      content: "Yes, that's correct. I'm looking forward to the deep tissue massage session.",
      timestamp: "10:32 AM",
      isOwn: true
    },
    {
      id: 3,
      senderId: 1,
      senderName: "Sarah Johnson",
      content: "Perfect! Please arrive 5 minutes early. Is there any specific area you'd like me to focus on?",
      timestamp: "10:35 AM",
      isOwn: false
    },
    {
      id: 4,
      senderId: user?.id,
      senderName: user?.name,
      content: "I've been having some tension in my shoulders and upper back from work.",
      timestamp: "10:37 AM",
      isOwn: true
    },
    {
      id: 5,
      senderId: 1,
      senderName: "Sarah Johnson",
      content: "Thank you for booking! Looking forward to our session tomorrow.",
      timestamp: "10:40 AM",
      isOwn: false
    }
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      // Here you would send the message via WebSocket or API
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 overflow-hidden">
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
            <div className="text-sm text-gray-600">
              Messages
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Chat List */}
          <div className="lg:col-span-1 h-full">
            <Card className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-lg flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-xl font-bold text-gray-900">Messages</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-1 p-4">
                    {filteredChats.map((chat) => (
                      <motion.div
                        key={chat.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 cursor-pointer transition-colors rounded-lg ${
                          selectedChat?.id === chat.id
                            ? 'bg-purple-50 border-r-4 border-purple-500'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedChat(chat)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={chat.avatar} alt={chat.name} />
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                {chat.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {chat.online && (
                              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 truncate">{chat.name}</p>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                {chat.unread > 0 && (
                                  <Badge className="bg-purple-600 text-white text-xs">
                                    {chat.unread}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">{chat.timestamp}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 h-full">
            {selectedChat ? (
              <Card className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-lg flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {selectedChat.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedChat.online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedChat.name}</h3>
                        <p className="text-sm text-gray-600">
                          {selectedChat.online ? 'Online' : 'Last seen recently'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words ${
                            msg.isOwn
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              msg.isOwn ? 'text-purple-100' : 'text-gray-500'
                            }`}>
                              {msg.timestamp}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a chat to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
