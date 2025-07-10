
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMongoAuth } from '@/contexts/MongoAuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Camera,
  Save,
  Trash2,
  Upload,
  X,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  Globe,
  Users,
  MessageSquare,
  Image,
  Video,
  Download,
  HelpCircle,
  LogOut,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
  const { user, updateProfile, uploadProfilePicture, signOut } = useMongoAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    role: user?.role || 'buyer'
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    newFollowers: true,
    likes: true,
    comments: true,
    mentions: true,
    bookings: true,
    promotions: false
  });
  
  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true,
    showEmail: false,
    showPhone: false,
    allowTagging: true,
    searchable: true,
    showActivity: true
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    deviceManagement: true,
    sessionTimeout: '30',
    passwordChangeRequired: false
  });

  // Content settings
  const [content, setContent] = useState({
    autoPlayVideos: true,
    showSensitiveContent: false,
    dataUsage: 'wifi-only',
    downloadQuality: 'high',
    storageLimit: '1GB'
  });

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only JPEG, PNG, and GIF files are allowed",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Image must be smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    
    setUploading(true);
    try {
      const result = await uploadProfilePicture(selectedImage);
      if (!result.error) {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProfileUpdate = async () => {
    setUpdating(true);
    try {
      await updateProfile(profileData);
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const saveSettings = (settingType: string) => {
    toast({
      title: "Settings Updated",
      description: `Your ${settingType} settings have been saved.`,
    });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted successfully.",
        });
        signOut();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const exportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your data export has been started. You'll receive an email when it's ready.",
    });
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
            <div className="text-sm text-gray-600">
              Settings
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile" className="flex items-center gap-1 text-xs">
                <User className="h-3 w-3" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs">
                <Bell className="h-3 w-3" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-1 text-xs">
                <Shield className="h-3 w-3" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 text-xs">
                <Lock className="h-3 w-3" />
                Security
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-1 text-xs">
                <Image className="h-3 w-3" />
                Content
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-1 text-xs">
                <CreditCard className="h-3 w-3" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32 border-4 border-purple-200">
                      <AvatarImage 
                        src={imagePreview || (user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : "")} 
                        alt={profileData.name} 
                      />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-4xl">
                        {profileData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-2 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelection}
                        className="hidden"
                      />
                      
                      {selectedImage ? (
                        <div className="flex items-center space-x-2 justify-center">
                          <Button 
                            onClick={handleImageUpload}
                            disabled={uploading}
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                          >
                            {uploading ? (
                              <>
                                <Upload className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Photo
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={clearImageSelection}
                            disabled={uploading}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 justify-center"
                        >
                          <Camera className="h-4 w-4" />
                          Change Photo
                        </Button>
                      )}
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      {profileData.role === 'buyer' ? 'Client' : 'Service Provider'}  
                    </Badge>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        placeholder="Enter your location"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button 
                      onClick={handleProfileUpdate} 
                      disabled={updating}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {updating ? (
                        <>
                          <Save className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    {/* Push Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'pushNotifications', label: 'Enable Push Notifications', desc: 'Receive notifications on your device' },
                          { key: 'newFollowers', label: 'New Followers', desc: 'When someone follows you' },
                          { key: 'likes', label: 'Likes', desc: 'When someone likes your posts' },
                          { key: 'comments', label: 'Comments', desc: 'When someone comments on your posts' },
                          { key: 'mentions', label: 'Mentions', desc: 'When someone mentions you' },
                          { key: 'bookings', label: 'Bookings', desc: 'Booking confirmations and updates' }
                        ].map(({ key, label, desc }) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">{label}</Label>
                              <p className="text-sm text-gray-500">{desc}</p>
                            </div>
                            <Switch
                              checked={Boolean(notifications[key as keyof typeof notifications])}
                              onCheckedChange={(checked) => setNotifications({...notifications, [key]: checked})}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email notifications' },
                          { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotional content and updates' },
                          { key: 'promotions', label: 'Special Offers', desc: 'Exclusive deals and promotions' }
                        ].map(({ key, label, desc }) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">{label}</Label>
                              <p className="text-sm text-gray-500">{desc}</p>
                            </div>
                            <Switch
                              checked={Boolean(notifications[key as keyof typeof notifications])}
                              onCheckedChange={(checked) => setNotifications({...notifications, [key]: checked})}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* SMS Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">SMS Notifications</h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">SMS Alerts</Label>
                          <p className="text-sm text-gray-500">Critical updates via SMS</p>
                        </div>
                        <Switch
                          checked={notifications.smsNotifications}
                          onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => saveSettings('notification')} 
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Privacy Tab */}
            <TabsContent value="privacy">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    {/* Profile Privacy */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Profile Privacy</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="visibility">Profile Visibility</Label>
                          <Select value={privacy.profileVisibility} onValueChange={(value) => setPrivacy({...privacy, profileVisibility: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-2" />
                                  Public - Anyone can see your profile
                                </div>
                              </SelectItem>
                              <SelectItem value="private">
                                <div className="flex items-center">
                                  <Lock className="h-4 w-4 mr-2" />
                                  Private - Only approved followers
                                </div>
                              </SelectItem>
                              <SelectItem value="friends">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  Friends Only
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {[
                          { key: 'showOnlineStatus', label: 'Show Online Status', desc: 'Let others see when you\'re active' },
                          { key: 'showEmail', label: 'Show Email', desc: 'Display email on your profile' },
                          { key: 'showPhone', label: 'Show Phone', desc: 'Display phone number on your profile' },
                          { key: 'searchable', label: 'Searchable Profile', desc: 'Allow others to find you in search' },
                          { key: 'showActivity', label: 'Show Activity', desc: 'Show your recent activity to others' }
                        ].map(({ key, label, desc }) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">{label}</Label>
                              <p className="text-sm text-gray-500">{desc}</p>
                            </div>
                            <Switch
                              checked={Boolean(privacy[key as keyof typeof privacy])}
                              onCheckedChange={(checked) => setPrivacy({...privacy, [key]: checked})}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Communication Privacy */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Communication</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'allowDirectMessages', label: 'Direct Messages', desc: 'Allow others to send you messages' },
                          { key: 'allowTagging', label: 'Allow Tagging', desc: 'Let others tag you in posts and comments' }
                        ].map(({ key, label, desc }) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">{label}</Label>
                              <p className="text-sm text-gray-500">{desc}</p>
                            </div>
                            <Switch
                              checked={Boolean(privacy[key as keyof typeof privacy])}
                              onCheckedChange={(checked) => setPrivacy({...privacy, [key]: checked})}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => saveSettings('privacy')} 
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="text-base">Enable 2FA</Label>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={security.twoFactorEnabled}
                            onCheckedChange={(checked) => setSecurity({...security, twoFactorEnabled: checked})}
                          />
                          <Button variant="outline" size="sm">
                            Setup
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Login Security */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Login Security</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'loginAlerts', label: 'Login Alerts', desc: 'Get notified of new logins to your account' },
                          { key: 'deviceManagement', label: 'Device Management', desc: 'Monitor devices that have access to your account' }
                        ].map(({ key, label, desc }) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">{label}</Label>
                              <p className="text-sm text-gray-500">{desc}</p>
                            </div>
                            <Switch
                              checked={Boolean(security[key as keyof typeof security])}
                              onCheckedChange={(checked) => setSecurity({...security, [key]: checked})}
                            />
                          </div>
                        ))}

                        <div className="space-y-2">
                          <Label htmlFor="sessionTimeout">Session Timeout</Label>
                          <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity({...security, sessionTimeout: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeout" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="240">4 hours</SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Password Security */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Password Security</h3>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Regular Password Changes</Label>
                            <p className="text-sm text-gray-500">Require password change every 90 days</p>
                          </div>
                          <Switch
                            checked={security.passwordChangeRequired}
                            onCheckedChange={(checked) => setSecurity({...security, passwordChangeRequired: checked})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => saveSettings('security')} 
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Content & Media Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    {/* Media Settings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Media Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Auto-play Videos</Label>
                            <p className="text-sm text-gray-500">Automatically play videos in your feed</p>
                          </div>
                          <Switch
                            checked={content.autoPlayVideos}
                            onCheckedChange={(checked) => setContent({...content, autoPlayVideos: checked})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dataUsage">Data Usage</Label>
                          <Select value={content.dataUsage} onValueChange={(value) => setContent({...content, dataUsage: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select data usage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="wifi-only">WiFi Only</SelectItem>
                              <SelectItem value="reduced">Reduced Data</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High Quality</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="downloadQuality">Download Quality</Label>
                          <Select value={content.downloadQuality} onValueChange={(value) => setContent({...content, downloadQuality: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low (Save Space)</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="original">Original</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Content Filtering */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Content Filtering</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Sensitive Content</Label>
                            <p className="text-sm text-gray-500">Show posts that might contain sensitive content</p>
                          </div>
                          <Switch
                            checked={content.showSensitiveContent}
                            onCheckedChange={(checked) => setContent({...content, showSensitiveContent: checked})}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Storage */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Storage</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="storageLimit">Storage Limit</Label>
                          <Select value={content.storageLimit} onValueChange={(value) => setContent({...content, storageLimit: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select limit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="500MB">500 MB</SelectItem>
                              <SelectItem value="1GB">1 GB</SelectItem>
                              <SelectItem value="2GB">2 GB</SelectItem>
                              <SelectItem value="5GB">5 GB</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button variant="outline" className="w-full justify-start">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Cache
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => saveSettings('content')} 
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <div className="space-y-6">
                {/* Account Information */}
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-900">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Account Type</Label>
                        <p className="font-medium">{user?.role === 'provider' ? 'Service Provider' : 'Client'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Member Since</Label>
                        <p className="font-medium">January 2024</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Account Status</Label>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Verification Status</Label>
                        <Badge variant={user?.isVerified ? "default" : "secondary"}>
                          {user?.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Download Your Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={exportData}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Account Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help & Support
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg border-red-200">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-red-600 flex items-center">
                      <AlertTriangle className="h-6 w-6 mr-2" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                        <div>
                          <h3 className="font-medium text-gray-900">Deactivate Account</h3>
                          <p className="text-sm text-gray-500">Temporarily disable your account</p>
                        </div>
                        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                          Deactivate
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                        <div>
                          <h3 className="font-medium text-gray-900">Delete Account</h3>
                          <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </Button>
                      </div>
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

export default SettingsPage;
