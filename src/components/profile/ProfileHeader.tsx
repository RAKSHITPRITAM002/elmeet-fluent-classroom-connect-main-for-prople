
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  user: any;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={user?.avatar || ''} />
        <AvatarFallback className="text-3xl">
          {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-3xl font-bold">{user?.name}</h1>
        <p className="text-gray-500">{user?.email}</p>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <span className={`inline-block px-2 py-1 rounded-full ${
            user?.subscription?.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {user?.subscription?.type || 'Free'} Plan
          </span>
          {user?.subscription?.expiresAt && (
            <span className="ml-2">
              Expires: {new Date(user.subscription.expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
