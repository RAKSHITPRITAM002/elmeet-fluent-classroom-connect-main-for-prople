import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from '@/components/admin/AdminLayout'; // Adjust path

interface UserData { // More detailed for editing
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  profile?: {
    bio?: string | null;
    location?: string | null;
    websiteUrl?: string | null;
    avatarUrl?: string | null;
    subscriptionStatus?: string | null;
    // other profile fields
  };
  // other user fields
}

const EditUserPage = () => {
  const router = useRouter();
  const { id } = router.query; // Get user ID from URL query parameter

  const [user, setUser] = useState<Partial<UserData> | null>(null); // Use Partial for editable fields
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const fetchUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const headers: HeadersInit = {};
          if (process.env.NODE_ENV === 'development') {
              headers['x-user-id'] = 'mock-admin-id'; // Simulate admin user for API call
          }
          const response = await fetch(`/api/admin/users/${id}`, { headers });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Failed to fetch user: ${response.statusText}`);
          }
          const data: UserData = await response.json();
          setUser(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    } else if (id) { // id is present but not a string (e.g. string[])
        setError("Invalid user ID in URL.");
        setIsLoading(false);
    }
    // If no id, it might mean router is not ready yet, or bad URL.
    // Handled by isLoading or error state.
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const val = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    if (name.startsWith('profile.')) {
        const profileField = name.split('.')[1];
        setUser(prev => ({
            ...prev,
            profile: { ...(prev?.profile || {}), [profileField]: val }
        }));
    } else {
        setUser(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !id || typeof id !== 'string') return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Prepare data for PUT request (only send changed fields or all editable fields)
    const { id: userId, createdAt, ...dataToUpdate } = user as UserData & { createdAt?: any }; // Exclude non-editable fields

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (process.env.NODE_ENV === 'development') {
          headers['x-user-id'] = 'mock-admin-id';
      }
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(dataToUpdate),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to update user: ${response.statusText}`);
      }
      const updatedUser = await response.json();
      setUser(updatedUser); // Update local state with response from server
      setSuccessMessage('User updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  if (!router.isReady || (isLoading && !user && !error)) { // Wait for router and initial load
    return <AdminLayout><div className="text-center p-4">Loading user details...</div></AdminLayout>;
  }
  if (error) {
    return <AdminLayout><div className="p-4 bg-red-100 text-red-700 rounded">{error}</div></AdminLayout>;
  }
  if (!user) {
    return <AdminLayout><div className="p-4 text-center">User not found or ID is missing.</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Edit User: {user.name || user.email}</h1>
      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4 max-w-2xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" name="name" id="name" value={user.name || ''} onChange={handleInputChange}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" id="email" value={user.email || ''} onChange={handleInputChange}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="isAdmin" id="isAdmin" checked={user.isAdmin || false} onChange={handleInputChange}
                 className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
          <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">Is Admin?</label>
        </div>
        <hr/>
        <h3 className="text-lg font-medium">Profile Details</h3>
        <div>
          <label htmlFor="profile.bio" className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea name="profile.bio" id="profile.bio" value={user.profile?.bio || ''} onChange={handleInputChange} rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="profile.location" className="block text-sm font-medium text-gray-700">Location</label>
          <input type="text" name="profile.location" id="profile.location" value={user.profile?.location || ''} onChange={handleInputChange}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="profile.subscriptionStatus" className="block text-sm font-medium text-gray-700">Subscription Status</label>
          <select name="profile.subscriptionStatus" id="profile.subscriptionStatus" value={user.profile?.subscriptionStatus || 'free'} onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
            <option value="free">Free</option>
            <option value="premium_monthly">Premium Monthly</option>
            <option value="premium_yearly">Premium Yearly</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex space-x-3">
            <button type="submit" disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => router.push('/admin/users')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Back to Users
            </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EditUserPage;