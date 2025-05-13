import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register, validateEmail } = useAuth();
  const { toast } = useToast();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Reject patterns like "xeds@sjdjsd"
      const invalidPattern = /^[a-z0-9]+@[a-z0-9]+$/i;
      if (invalidPattern.test(email)) {
        throw new Error('Please use a proper email address format with a valid domain');
      }
      
      // Check if email domain is valid
      if (!validateEmail(email)) {
        throw new Error('Please use a premium email domain (gmail.com, outlook.com, hotmail.com, yahoo.com, icloud.com, etc.)');
      }
      
      // Validate password
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      if (isLoginMode) {
        // Pass credentials as a single object
        await login({ email, password }); 
        toast({
          title: "Login successful",
          description: "Welcome back to EL:MEET!",
        });
      } else {
        // Additional validation for registration
        if (!name.trim()) {
        toast({
            title: "Registration Error",
            description: "Name is required for registration.",
        });
          return;
      }
        
        // Pass registration details as a single object
        await register({ name, email, password }); 
      toast({
          title: "Registration successful",
          description: "Welcome to EL:MEET!",
      });
    }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[400px] mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#16849b]">
          {isLoginMode ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          {isLoginMode
            ? 'Enter your email and password to access your account'
            : 'Fill out the form below to create your EL:MEET account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {!isLoginMode && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLoginMode}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use domains like gmail.com, outlook.com, hotmail.com, yahoo.com, icloud.com
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 6 characters
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center gap-2">
              <AlertCircle size={16} />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <Button 
            type="submit"
            className="w-full bg-[#16849b] hover:bg-[#0d7390]"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : isLoginMode ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center w-full text-gray-500">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-[#16849b] hover:underline font-medium"
          >
            {isLoginMode ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
