
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import LoginForm from '@/components/LoginForm';
import { Video, Users, Globe, Layers, MessageSquare, Pencil, CheckCircle } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const handleDemoClick = () => {
    toast({
      title: "Coming Soon",
      description: "The demo feature will be available in the next update.",
    });
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-elmeet-blue-light to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-elmeet-blue-dark mb-6">
              EL:MEET
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              The ultimate video conferencing platform designed specifically for language teaching
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/meeting">
                  <Button size="lg" className="bg-elmeet-blue hover:bg-elmeet-blue-dark px-8">
                    Start a Meeting
                  </Button>
                </Link>
              ) : (
                <Link to="/">
                  <Button size="lg" className="bg-elmeet-blue hover:bg-elmeet-blue-dark px-8" onClick={() => {
                    const loginForm = document.getElementById('login-section');
                    if (loginForm) {
                      loginForm.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}>
                    Get Started
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleDemoClick}
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Designed for Language Teachers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Video className="w-8 h-8 text-elmeet-blue" />}
              title="Ultra-Low Latency"
              description="Experience crystal clear audio and video with minimal delay, perfect for language conversations."
              linkTo={isAuthenticated ? "/meeting" : "/login"}
              buttonText={isAuthenticated ? "Join Meeting" : "Sign In to Try"}
            />
            <FeatureCard 
              icon={<Pencil className="w-8 h-8 text-elmeet-blue" />}
              title="Advanced Annotation"
              description="Mark up shared content with our floating annotation toolbar for interactive learning."
              linkTo={isAuthenticated ? "/meeting" : "/login"}
              buttonText={isAuthenticated ? "Try Annotations" : "Sign In to Try"}
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-elmeet-blue" />}
              title="Language Tools"
              description="Integrated character pad, dictionary, and phrases to assist with non-Latin scripts and translations."
              linkTo={isAuthenticated ? "/language-tools" : "/login"}
              buttonText={isAuthenticated ? "Open Tools" : "Sign In to Try"}
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-elmeet-blue" />}
              title="Role Play & Scenarios"
              description="Create interactive language scenarios with assignable roles and descriptions."
              linkTo={isAuthenticated ? "/roleplay" : "/login"}
              buttonText={isAuthenticated ? "Create Scenarios" : "Sign In to Try"}
            />
            <FeatureCard 
              icon={<Layers className="w-8 h-8 text-elmeet-blue" />}
              title="Polls & Quizzes"
              description="Assess understanding and engage students with interactive polling and quizzing tools."
              linkTo={isAuthenticated ? "/polls-quizzes" : "/login"}
              buttonText={isAuthenticated ? "Create Polls" : "Sign In to Try"}
            />
            <FeatureCard 
              icon={<MessageSquare className="w-8 h-8 text-elmeet-blue" />}
              title="Enhanced Chat"
              description="Rich text formatting, file sharing, and emoji support for better communication."
              linkTo={isAuthenticated ? "/meeting" : "/login"}
              buttonText={isAuthenticated ? "Try Chat" : "Sign In to Try"}
            />
          </div>
        </div>
      </div>
      
      {/* Benefits Section - Adding a new section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose EL:MEET?
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <BenefitItem
              icon={<CheckCircle className="w-6 h-6 text-elmeet-green" />}
              title="Purpose-Built for Language Education"
              description="Unlike general video conferencing tools, every feature is optimized for language teaching and learning."
            />
            <BenefitItem
              icon={<CheckCircle className="w-6 h-6 text-elmeet-green" />}
              title="Improved Student Engagement"
              description="Interactive tools keep students actively participating throughout the entire lesson."
            />
            <BenefitItem
              icon={<CheckCircle className="w-6 h-6 text-elmeet-green" />}
              title="Seamless Learning Experience"
              description="All the tools you need in one platform - no switching between multiple applications."
            />
            <BenefitItem
              icon={<CheckCircle className="w-6 h-6 text-elmeet-green" />}
              title="Secure and Reliable"
              description="Enterprise-grade security and stability for uninterrupted language lessons."
            />
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div id="login-section" className="bg-elmeet-blue-light py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your language teaching?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join EL:MEET today and experience the difference that purpose-built tools make in online language education.
          </p>
          
          {!isAuthenticated && (
            <div className="max-w-md mx-auto">
              <LoginForm />
            </div>
          )}
          
          {isAuthenticated && (
            <div className="space-y-4">
              <Link to="/meeting">
                <Button size="lg" className="bg-elmeet-blue hover:bg-elmeet-blue-dark px-8">
                  Start a Meeting Now
                </Button>
              </Link>
              <div className="flex justify-center gap-4 mt-4">
                <Link to="/dashboard">
                  <Button variant="outline" size="lg">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to="/polls-quizzes">
                  <Button variant="outline" size="lg">
                    Create Polls & Quizzes
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} EL:MEET. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  linkTo, 
  buttonText 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  linkTo?: string,
  buttonText?: string
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="bg-elmeet-blue-light w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-4">{description}</p>
      {linkTo && buttonText && (
        <div className="mt-auto text-center">
          <Link to={linkTo} className="inline-block bg-elmeet-blue hover:bg-elmeet-blue-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            {buttonText}
          </Link>
        </div>
      )}
    </div>
  );
};

const BenefitItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default Index;
