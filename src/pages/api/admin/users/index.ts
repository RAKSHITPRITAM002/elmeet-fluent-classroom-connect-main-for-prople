import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '@/middleware/adminAuth'; // Adjust path
// import { db } from '@/lib/db'; // Your DB client
// import { User, UserProfile } from '@prisma/client'; // Prisma types

// Mock data for users and profiles for admin view
interface MockAdminUserView {
    id: string;
    name: string | null;
    email: string;
    isAdmin: boolean;
    createdAt: string;
    profile?: {
        bio?: string | null;
        location?: string | null;
        subscriptionStatus?: string | null;
    };
}
let mockAdminUsersDB: MockAdminUserView[] = [
    { id: 'mock-user-id', name: 'Demo User', email: 'user@example.com', isAdmin: false, createdAt: new Date().toISOString(), profile: { subscriptionStatus: 'free', location: 'Tech City' } },
    { id: 'mock-admin-id', name: 'Admin User', email: 'admin@example.com', isAdmin: true, createdAt: new Date().toISOString(), profile: { subscriptionStatus: 'premium_yearly', location: 'Admin HQ' } },
    { id: 'user-3', name: 'Jane Doe', email: 'jane@example.com', isAdmin: false, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), profile: { bio: 'Loves to travel', subscriptionStatus: 'free' } },
];


async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Real implementation with Prisma:
      // const users = await db.user.findMany({
      //   select: { // Select only necessary fields, avoid sending password hash
      //     id: true,
      //     name: true,
      //     email: true,
      //     isAdmin: true,
      //     createdAt: true,
      //     profile: {
      //       select: {
      //         subscriptionStatus: true,
      //         location: true,
      //       }
      //     }
      //   },
      //   orderBy: { createdAt: 'desc' },
      // });

      // Mock implementation:
      const users = mockAdminUsersDB;
      return res.status(200).json(users);
    } catch (error) {
      console.error('Admin: Error fetching users:', error);
      return res.status(500).json({ message: 'Error fetching users.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default requireAdminAuth(handler); // Protect this route with admin auth