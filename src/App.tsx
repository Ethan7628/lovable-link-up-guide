
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MongoAuthProvider, useMongoAuth } from "./contexts/MongoAuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";
import ServicesPage from "./pages/ServicesPage";
import ChatPage from "./pages/ChatPage";
import BookingsPage from "./pages/BookingsPage";
import SettingsPage from "./pages/SettingsPage";
import ReviewsPage from "./pages/ReviewsPage";
import FeedPage from "./pages/FeedPage";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useMongoAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading BodyConnect...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
      />
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/feed" 
        element={user ? <FeedPage /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/profile/:userId?" 
        element={user ? <ProfilePage /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/services" 
        element={user ? <ServicesPage /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/chat" 
        element={user ? <ChatPage /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/bookings" 
        element={user ? <BookingsPage /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/settings" 
        element={user ? <SettingsPage /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/reviews" 
        element={user ? <ReviewsPage /> : <Navigate to="/auth" replace />} 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MongoAuthProvider>
            <AppRoutes />
          </MongoAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
