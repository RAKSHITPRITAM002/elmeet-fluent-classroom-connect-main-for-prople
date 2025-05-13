
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabContent from '@/components/profile/ProfileTabContent';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // In a real application, you would update the user profile in Supabase here
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <ProfileHeader user={user} />
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileTabContent
              activeTab="profile"
              user={user}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              saving={saving}
              handleUpdateProfile={handleUpdateProfile}
              handleLogout={handleLogout}
            />
          </TabsContent>
          
          <TabsContent value="subscription">
            <ProfileTabContent
              activeTab="subscription"
              user={user}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              saving={saving}
              handleUpdateProfile={handleUpdateProfile}
              handleLogout={handleLogout}
            />
          </TabsContent>
          
          <TabsContent value="security">
            <ProfileTabContent
              activeTab="security"
              user={user}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              saving={saving}
              handleUpdateProfile={handleUpdateProfile}
              handleLogout={handleLogout}
            />
          </TabsContent>
          
          <TabsContent value="settings">
            <ProfileTabContent
              activeTab="settings"
              user={user}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              saving={saving}
              handleUpdateProfile={handleUpdateProfile}
              handleLogout={handleLogout}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfilePage;
