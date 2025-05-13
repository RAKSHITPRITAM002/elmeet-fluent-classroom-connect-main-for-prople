
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { AreaChart, BarChart as BarChartIcon, LineChart, Users, Settings, Shield, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from 'react-router-dom';

// Demo data
const usageData = [
  { name: 'Jan', meetings: 40, minutes: 650, participants: 85 },
  { name: 'Feb', meetings: 35, minutes: 550, participants: 75 },
  { name: 'Mar', meetings: 50, minutes: 700, participants: 90 },
  { name: 'Apr', meetings: 65, minutes: 900, participants: 120 },
  { name: 'May', meetings: 80, minutes: 1200, participants: 150 },
  { name: 'Jun', meetings: 75, minutes: 1100, participants: 140 },
  { name: 'Jul', meetings: 90, minutes: 1300, participants: 160 },
];

const organizationUsers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', role: 'admin', status: 'active' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'teacher', status: 'active' },
  { id: 3, name: 'Michael Brown', email: 'michael@example.com', role: 'teacher', status: 'active' },
  { id: 4, name: 'Lisa Williams', email: 'lisa@example.com', role: 'teacher', status: 'active' },
  { id: 5, name: 'Robert Garcia', email: 'robert@example.com', role: 'user', status: 'pending' },
];

const subscriptionPlans = [
  { 
    id: 'basic', 
    name: 'Basic', 
    price: '$9.99/month', 
    features: [
      '1 host license', 
      'Up to 10 participants', 
      '40 min meeting limit', 
      'Basic annotation tools'
    ],
    current: false 
  },
  { 
    id: 'premium', 
    name: 'Premium', 
    price: '$19.99/month', 
    features: [
      '5 host licenses', 
      'Up to 50 participants', 
      'Unlimited meeting length', 
      'All annotation tools',
      'Character pad for all languages',
      'Poll & quiz creation'
    ],
    current: true 
  },
  { 
    id: 'enterprise', 
    name: 'Enterprise', 
    price: 'Contact for pricing', 
    features: [
      'Unlimited host licenses', 
      'Up to 100 participants', 
      'Unlimited meeting length', 
      'All features included',
      'SSO integration',
      'Dedicated support',
      'Custom branding'
    ],
    current: false 
  },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState('meetings');
  
  // Check if user is admin
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage your organization and monitor usage</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value="48" icon={<Users className="h-8 w-8" />} trend="+12%" />
          <StatCard title="Total Meetings" value="392" icon={<BarChartIcon className="h-8 w-8" />} trend="+24%" />
          <StatCard title="Meeting Minutes" value="8,450" icon={<LineChart className="h-8 w-8" />} trend="+18%" />
          <StatCard title="Active Licenses" value="5/10" icon={<Shield className="h-8 w-8" />} trend="50%" />
        </div>
        
        <Tabs defaultValue="usage" className="w-full">
          <TabsList>
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>
                  <div className="flex space-x-2">
                    <Button 
                      variant={chartData === 'meetings' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setChartData('meetings')}
                      className={chartData === 'meetings' ? 'bg-elmeet-blue hover:bg-elmeet-blue-dark' : ''}
                    >
                      Meetings
                    </Button>
                    <Button 
                      variant={chartData === 'minutes' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartData('minutes')}
                      className={chartData === 'minutes' ? 'bg-elmeet-blue hover:bg-elmeet-blue-dark' : ''}
                    >
                      Minutes
                    </Button>
                    <Button 
                      variant={chartData === 'participants' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartData('participants')}
                      className={chartData === 'participants' ? 'bg-elmeet-blue hover:bg-elmeet-blue-dark' : ''}
                    >
                      Participants
                    </Button>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey={chartData} 
                        fill="#4f46e5" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Organization Users</CardTitle>
                  <CardDescription>Manage users and permissions</CardDescription>
                </div>
                <Button className="bg-elmeet-blue hover:bg-elmeet-blue-dark">
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Name</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Email</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Role</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizationUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4 capitalize">{user.role}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Remove</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>View and manage your current subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">Current Plan: Premium</h3>
                        <p className="text-gray-600">Next billing date: August 15, 2023</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-elmeet-blue" />
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg mt-6">Available Plans</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {subscriptionPlans.map((plan) => (
                      <Card 
                        key={plan.id} 
                        className={plan.current ? 'border-elmeet-blue bg-blue-50' : ''}
                      >
                        <CardHeader>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>
                            <span className="font-bold text-lg">{plan.price}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center text-sm">
                                <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <div className="p-6 pt-0">
                          <Button 
                            disabled={plan.current} 
                            variant={plan.current ? "outline" : "default"}
                            className="w-full"
                          >
                            {plan.current ? 'Current Plan' : `Switch to ${plan.name}`}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure global settings for your organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Security Settings</h3>
                    <div className="flex items-center justify-between border p-4 rounded-md">
                      <div>
                        <p className="font-medium">Require password for meetings</p>
                        <p className="text-sm text-gray-500">All new meetings will require a password to join</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between border p-4 rounded-md">
                      <div>
                        <p className="font-medium">Only authenticated users can join meetings</p>
                        <p className="text-sm text-gray-500">Require users to sign in before joining meetings</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Default Meeting Settings</h3>
                    <div className="flex items-center justify-between border p-4 rounded-md">
                      <div>
                        <p className="font-medium">Start with video on</p>
                        <p className="text-sm text-gray-500">Video will be enabled when joining meetings</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between border p-4 rounded-md">
                      <div>
                        <p className="font-medium">Start with microphone on</p>
                        <p className="text-sm text-gray-500">Microphone will be enabled when joining meetings</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between border p-4 rounded-md">
                      <div>
                        <p className="font-medium">Enable annotation tools by default</p>
                        <p className="text-sm text-gray-500">Annotation tools will be enabled when starting meetings</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="bg-elmeet-blue hover:bg-elmeet-blue-dark">
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend: string }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          </div>
          <div className="bg-elmeet-blue-light p-4 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
