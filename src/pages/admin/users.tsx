import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout'; // Adjust path
import Link from 'next/link';

// Matches the structure from /api/admin/users
interface AdminUserView {
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  profile?: {
    subscriptionStatus?: string | null;
    location?: string | null;
  };
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // For demo, simulate admin header for protected route
        const headers: HeadersInit = {};
        if (process.env.NODE_ENV === 'development') {
            headers['x-user-id'] = 'mock-admin-id'; // Simulate admin user for API call
        }

        const response = await fetch('/api/admin/users', { headers });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to fetch users: ${response.statusText}`);
        }
        const data: AdminUserView[] = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <AdminLayout><div className="text-center p-4">Loading users...</div></AdminLayout>;
  }
  if (error) {
    return <AdminLayout><div className="p-4 bg-red-100 text-red-700 rounded">{error}</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{user.name || 'N/A'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">{user.profile?.subscriptionStatus || 'N/A'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/users/edit/${user.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Edit
                  </Link>
                  {/* Add Delete button with confirmation later */}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-center text-sm text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Placeholder for pagination if many users */}
    </AdminLayout>
  );
};

export default AdminUsersPage;

// Also create a placeholder for /admin/dashboard.tsx and /admin/settings.tsx
// e.g., src/pages/admin/dashboard.tsx
// import React from 'react';
// import { AdminLayout } from '@/components/admin/AdminLayout';
// const AdminDashboardPage = () => (<AdminLayout><h1 className="text-2xl font-bold">Admin Dashboard</h1><p>Usage statistics and system overview will be here.</p></AdminLayout>);
// export default AdminDashboardPage;