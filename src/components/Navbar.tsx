
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Video, BarChart, Users, Globe, Layers, MessageSquare, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart className="w-4 h-4 mr-2" /> },
    { path: '/polls-quizzes', label: 'Polls & Quizzes', icon: <Layers className="w-4 h-4 mr-2" /> },
    { path: '/roleplay', label: 'Role Play', icon: <Users className="w-4 h-4 mr-2" /> },
    { path: '/media-player', label: 'Media Player', icon: <Video className="w-4 h-4 mr-2" /> },
    { path: '/language-tools', label: 'Language Tools', icon: <Globe className="w-4 h-4 mr-2" /> },
    { path: '/meeting', label: 'Meeting', icon: <MessageSquare className="w-4 h-4 mr-2" /> },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Link to="/" className="text-2xl font-bold text-elmeet-blue-dark">EL:MEET</Link>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center mb-4 md:mb-0">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
            >
              <Button 
                variant={isActive(item.path) ? "default" : "ghost"} 
                size="sm"
                className={isActive(item.path) ? "bg-elmeet-blue hover:bg-elmeet-blue-dark" : ""}
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
          
          {user?.role === 'admin' && (
            <Link to="/admin">
              <Button 
                variant={isActive('/admin') ? "default" : "ghost"} 
                size="sm"
                className={isActive('/admin') ? "bg-elmeet-blue hover:bg-elmeet-blue-dark" : ""}
              >
                <BarChart className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/profile">
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
