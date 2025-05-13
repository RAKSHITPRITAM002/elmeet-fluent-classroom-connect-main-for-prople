
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Calendar, Clock } from 'lucide-react';

interface AccountInfoTabProps {
  user: any;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  handleUpdateProfile: () => void;
  saving: boolean;
}

const AccountInfoTab: React.FC<AccountInfoTabProps> = ({
  user,
  name,
  setName,
  email,
  setEmail,
  handleUpdateProfile,
  saving
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your account details and profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled
            />
            <p className="text-xs text-gray-500">
              Your email address is used for login and cannot be changed
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.avatar || ''} />
                <AvatarFallback>
                  {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleUpdateProfile}
            disabled={saving}
            className="bg-elmeet-blue hover:bg-elmeet-blue-dark"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Account Type</p>
                <p className="text-gray-500">{user?.role || 'User'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Joined</p>
                <p className="text-gray-500">May 12, 2023</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Last Login</p>
                <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountInfoTab;
