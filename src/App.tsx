import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import PollsQuizzes from "./pages/PollsQuizzes";
import RolePlay from "./pages/RolePlay";
import MediaPlayer from "./pages/MediaPlayer";
import LanguageTools from "./pages/LanguageTools";
import MeetingRoom from "./pages/MeetingRoom";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./contexts/AuthContext";

// Create protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show loading state
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!isAuthenticated) {
    // Redirect to home if not authenticated
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Create admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Show loading state
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    // Redirect to dashboard if not admin
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Create the query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Navigate to="/#login-section" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/polls-quizzes" element={<ProtectedRoute><PollsQuizzes /></ProtectedRoute>} />
            <Route path="/roleplay" element={<ProtectedRoute><RolePlay /></ProtectedRoute>} />
            <Route path="/media-player" element={<ProtectedRoute><MediaPlayer /></ProtectedRoute>} />
            <Route path="/language-tools" element={<ProtectedRoute><LanguageTools /></ProtectedRoute>} />
            <Route path="/meeting" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />
            <Route path="/meeting/new" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />
            <Route path="/meeting/:id" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
