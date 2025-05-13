
import React from 'react';
import { Card } from "@/components/ui/card";
import AccountInfoTab from './tabs/AccountInfoTab';
import SecurityTab from './tabs/SecurityTab';
import SettingsTab from './tabs/SettingsTab';
import SubscriptionTab from './tabs/SubscriptionTab';

interface ProfileTabContentProps {
  activeTab: string;
  user: any;
  handleUpdateProfile: () => void;
  handleLogout: () => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  saving: boolean;
}

const ProfileTabContent: React.FC<ProfileTabContentProps> = ({
  activeTab,
  user,
  handleUpdateProfile,
  handleLogout,
  name,
  setName,
  email,
  setEmail,
  saving
}) => {
  switch (activeTab) {
    case 'profile':
      return <AccountInfoTab 
        user={user}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        handleUpdateProfile={handleUpdateProfile}
        saving={saving}
      />;
    case 'subscription':
      return <SubscriptionTab user={user} />;
    case 'security':
      return <SecurityTab />;
    case 'settings':
      return <SettingsTab handleLogout={handleLogout} />;
    default:
      return <Card>Select a tab</Card>;
  }
};

export default ProfileTabContent;
