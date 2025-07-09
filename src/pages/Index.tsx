
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useMongoAuth } from "@/contexts/MongoAuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Star, 
  Users, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  Sparkles,
  Calendar,
  MessageSquare,
  DollarSign
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useMongoAuth();
  const { toast } = useToast();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleBecomeProvider = () => {
    if (user) {
      if (user.role === 'provider') {
        navigate("/dashboard");
        toast({
          title: "Welcome Back!",
          description: "You're already a service provider",
        });
      } else {
        toast({
          title: "Account Upgrade",
          description: "Contact support to upgrade to provider account",
        });
      }
    } else {
      navigate("/auth");
      toast({
        title: "Join as Provider",
        description: "Sign up to become a service provider",
      });
    }
  };

  const features = [
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: "Trusted Connections",
      description: "Connect with verified service providers in your area"
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      title: "Secure Platform",
      description: "Your safety and privacy are our top priorities"
    },
    {
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      title: "Quality Services",
      description: "Rated and reviewed by our community"
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-500" />,
      title: "Easy Booking",
      description: "Schedule services at your convenience"
    }
  ];

  const services = [
    { name: "Wellness & Massage", count: "500+", color: "bg-purple-100 text-purple-800" },
    { name: "Fitness Training", count: "300+", color: "bg-blue-100 text-blue-800" },
    { name: "Beauty Services", count: "400+", color: "bg-pink-100 text-pink-800" },
    { name: "Physiotherapy", count: "250+", color: "bg-green-100 text-green-800" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-purple-600 mr-2" />
              <span className="font-bold text-xl text-gray-900">BodyConnect</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleGetStarted}
                className="text-sm sm:text-base px-3 sm:px-4"
              >
                {user ? "Dashboard" : "Sign In"}
              </Button>
              <Button 
                onClick={handleBecomeProvider}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm sm:text-base px-3 sm:px-6 py-2 sm:py-2.5 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Become </span>Provider
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Connect with 
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Premium </span>
              Service Providers
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover trusted wellness, fitness, and lifestyle professionals in your area. 
              Book services, connect authentically, and experience quality care.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleBecomeProvider}
                className="border-2 border-purple-200 hover:border-purple-300 text-purple-700 hover:bg-purple-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300 w-full sm:w-auto"
              >
                <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Join as Provider
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BodyConnect?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of service booking with our innovative platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription className="text-gray-600 text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Popular Services
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our wide range of professional services
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {services.map((service, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Badge className={`${service.color} mb-3 text-sm px-3 py-1`}>
                    {service.count} providers
                  </Badge>
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                    {service.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who have found their perfect service providers
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              Start Booking Now
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              onClick={handleBecomeProvider}
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300 w-full sm:w-auto"
            >
              <DollarSign className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Earn as Provider
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 text-purple-400 mr-2" />
                <span className="font-bold text-lg">BodyConnect</span>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">
                Connecting people with trusted service providers for wellness, fitness, and lifestyle needs.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Wellness</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fitness</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Beauty</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Therapy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 BodyConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
