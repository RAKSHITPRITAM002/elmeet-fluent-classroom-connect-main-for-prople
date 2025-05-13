import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '@/middleware/adminAuth'; // Adjust path
// import { db } from '@/lib/db';
// import { User, UserProfile } from '@prisma/client';

// Using the same mockAdminUsersDB from the index file for consistency in demo
// In a real app, this would interact with the actual database.
let mockAdminUsersDB_for_id_route: Array<{
    id: string; name: string | null; email: string; isAdmin: boolean; createdAt: string;
    profile?: { bio?: string | null; location?: string | null; subscriptionStatus?: string | null; websiteUrl?: string | null; avatarUrl?: string | null; };
}> = [ // Ensure this matches the structure used in the index file or is a more detailed view
    { id: 'mock-user-id', name: 'Demo User', email: 'user@example.com', isAdmin: false, createdAt: new Date().toISOString(), profile: { subscriptionStatus: 'free', location: 'Tech City', bio: 'Loves coding' } },
    { id: 'mock-admin-id', name: 'Admin User', email: 'admin@example.com', isAdmin: true, createdAt: new Date().toISOString(), profile: { subscriptionStatus: 'premium_yearly', location: 'Admin HQ', bio: 'Manages the system' } },
    { id: 'user-3', name: 'Jane Doe', email: 'jane@example.com', isAdmin: false, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), profile: { bio: 'Loves to travel', subscriptionStatus: 'free' } },
];


async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'User ID must be a string.' });
  }

  if (req.method === 'GET') {
    try {
      // Real implementation:
      // const user = await db.user.findUnique({
      //   where: { id },
      //   include: { profile: true }, // Include full profile
      // });
      // if (!user) {
      //   return res.status(404).json({ message: 'User not found.' });
      // }
      // const { password, ...userWithoutPassword } = user; // Exclude password
      // return res.status(200).json(userWithoutPassword);

      // Mock implementation:
      const user = mockAdminUsersDB_for_id_route.find(u => u.id === id);
      if (!user) {
        return res.status(404).json({ message: 'User not found (mock).' });
      }
      return res.status(200).json(user);

    } catch (error) {
      console.error(`Admin: Error fetching user ${id}:`, error);
      return res.status(500).json({ message: `Error fetching user ${id}.` });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, email, isAdmin, profileData } = req.body; // profileData for UserProfile fields
      // Add validation for input fields

      // Real implementation:
      // const updatedUserData: Partial<User> = {};
      // if (name !== undefined) updatedUserData.name = name;
      // if (email !== undefined) updatedUserData.email = email; // Handle email uniqueness carefully
      // if (isAdmin !== undefined) updatedUserData.isAdmin = isAdmin;
      //
      // const updatedUser = await db.user.update({
      //   where: { id },
      //   data: updatedUserData,
      // });
      // if (profileData && Object.keys(profileData).length > 0) {
      //   await db.userProfile.update({ where: { userId: id }, data: profileData });
      // }
      // const finalUser = await db.user.findUnique({ where: { id }, include: { profile: true }});
      // const { password, ...userWithoutPassword } = finalUser!;
      // return res.status(200).json(userWithoutPassword);

      // Mock implementation:
      const userIndex = mockAdminUsersDB_for_id_route.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found (mock) for update.' });
      }
      if (name !== undefined) mockAdminUsersDB_for_id_route[userIndex].name = name;
      if (email !== undefined) mockAdminUsersDB_for_id_route[userIndex].email = email; // No uniqueness check in mock
      if (isAdmin !== undefined) mockAdminUsersDB_for_id_route[userIndex].isAdmin = isAdmin;
      if (profileData && mockAdminUsersDB_for_id_route[userIndex].profile) {
          mockAdminUsersDB_for_id_route[userIndex].profile = { ...mockAdminUsersDB_for_id_route[userIndex].profile, ...profileData };
      } else if (profileData) {
          mockAdminUsersDB_for_id_route[userIndex].profile = profileData;
      }
      console.log(`Admin: Updated user ${id} (mock):`, mockAdminUsersDB_for_id_route[userIndex]);
      return res.status(200).json(mockAdminUsersDB_for_id_route[userIndex]);

    } catch (error) {
      console.error(`Admin: Error updating user ${id}:`, error);
      return res.status(500).json({ message: `Error updating user ${id}.` });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']); // Add DELETE later if needed
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default requireAdminAuth(handler); // Protect this route