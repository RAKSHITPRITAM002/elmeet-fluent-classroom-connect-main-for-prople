import { NextApiRequest, NextApiResponse } from 'next';
// Assume you have a way to get the authenticated user's ID (e.g., from session, JWT)
// import { getSession } from 'next-auth/react'; // REMOVE THIS LINE if not using NextAuth.js
// import { verifyTokenAndGetUserId } from '@/utils/authUtils'; // Or your custom auth util
// import { db } from '@/lib/db'; // Your Prisma or other DB client
import { UserProfile } from '@prisma/client'; // Import your generated Prisma types

// Mock DB for demonstration if not using Prisma/real DB yet
let mockUserProfiles: Record<string, Partial<UserProfile> & { userId: string }> = {
  'mock-user-id': { // Assuming 'mock-user-id' is the ID of an authenticated user
    id: 'profile-123',
    userId: 'mock-user-id',
    bio: 'Loves coding and coffee.',
    avatarUrl: 'https://via.placeholder.com/150/007bff/FFFFFF?Text=User',
    websiteUrl: 'https://example.com',
    location: 'Tech City',
    subscriptionStatus: 'free',
  }
};


async function getAuthenticatedUserId(req: NextApiRequest): Promise<string | null> {
  // Replace with your actual authentication check
  // Example 1: Using NextAuth.js
  // const session = await getSession({ req });
  // if (session?.user?.id) { // Adjust 'id' if your session stores it differently
  //   return session.user.id as string;
  // }

  // Example 2: Custom token verification (conceptual)
  // const authHeader = req.headers.authorization;
  // if (authHeader && authHeader.startsWith('Bearer ')) {
  //   const token = authHeader.substring(7);
  //   try {
  //     const userId = await verifyTokenAndGetUserId(token);
  //     return userId;
  //   } catch (error) {
  //     console.warn('Token verification failed:', error);
  //     return null;
  //   }
  // }
  // For this demo, we'll hardcode a user ID if no session is found
  // In a real app, this would mean the user is unauthenticated.
  if (process.env.NODE_ENV === 'development' && !session) {
      console.warn("Mocking authenticated user ID for profile API in development.");
      return 'mock-user-id'; // Ensure this ID exists in mockUserProfiles or your DB
  }

  return null;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getAuthenticatedUserId(req);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  if (req.method === 'GET') {
    try {
      // Real implementation with Prisma:
      // let userProfile = await db.userProfile.findUnique({
      //   where: { userId },
      // });
      // if (!userProfile) {
      //   // Optionally create a basic profile if one doesn't exist for a valid user
      //   userProfile = await db.userProfile.create({ data: { userId } });
      // }

      // Mock implementation:
      let userProfile = mockUserProfiles[userId];
      if (!userProfile) {
        // Create a mock profile if it doesn't exist for the mock user
        mockUserProfiles[userId] = {
            id: `profile-${Date.now()}`,
            userId: userId,
            bio: '',
            subscriptionStatus: 'free',
        };
        userProfile = mockUserProfiles[userId];
        console.log(`Created mock profile for userId: ${userId}`);
      }

      return res.status(200).json(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ message: 'Error fetching user profile.' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { bio, avatarUrl, websiteUrl, location } = req.body;
      const dataToUpdate: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'>> = {};

      if (bio !== undefined) dataToUpdate.bio = bio;
      if (avatarUrl !== undefined) dataToUpdate.avatarUrl = avatarUrl; // Add validation for URL format
      if (websiteUrl !== undefined) dataToUpdate.websiteUrl = websiteUrl; // Add validation
      if (location !== undefined) dataToUpdate.location = location;

      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'No update data provided.' });
      }

      // Real implementation with Prisma:
      // const updatedProfile = await db.userProfile.update({
      //   where: { userId },
      //   data: dataToUpdate,
      // });

      // Mock implementation:
      if (!mockUserProfiles[userId]) {
         mockUserProfiles[userId] = { id: `profile-${Date.now()}`, userId: userId, bio: '', subscriptionStatus: 'free' }; // Ensure profile exists
      }
      mockUserProfiles[userId] = { ...mockUserProfiles[userId], ...dataToUpdate };
      const updatedProfile = mockUserProfiles[userId];
      console.log(`Updated mock profile for userId ${userId}:`, updatedProfile);


      return res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      // Handle potential errors like Prisma's P2025 (Record to update not found) if not creating on GET
      return res.status(500).json({ message: 'Error updating user profile.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
