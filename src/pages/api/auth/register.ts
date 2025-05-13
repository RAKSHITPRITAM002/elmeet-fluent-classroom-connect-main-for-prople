import { NextApiRequest, NextApiResponse } from 'next';
import { ALLOWED_EMAIL_DOMAINS, isPremiumDomain } from '@/config/authConfig'; // Adjust path as needed
// Assume you have a password hashing utility and database interaction logic
// import { hashPassword } from '@/utils/authUtils';
// import { db } from '@/lib/db'; // Your Prisma or other DB client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { email, password, name } = req.body; // Add other fields as necessary

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required.' });
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Premium domain validation
    if (!isPremiumDomain(email)) {
      return res.status(400).json({
        message: `Registration is currently restricted to specific email providers (e.g., ${ALLOWED_EMAIL_DOMAINS.slice(0,3).join(', ')}, etc.). Please use a different email address.`,
        field: 'email' // Optional: to help frontend highlight the field
      });
    }

    // Check if user already exists (example with Prisma)
    // const existingUser = await db.user.findUnique({ where: { email } });
    // if (existingUser) {
    //   return res.status(409).json({ message: 'Email already registered.', field: 'email' });
    // }

    // Hash password
    // const hashedPassword = await hashPassword(password);

    // Create user (example with Prisma)
    // const newUser = await db.user.create({
    //   data: {
    //     email,
    //     name,
    //     password: hashedPassword,
    //   },
    // });

    // For demonstration without DB:
    console.log(`Mock registration for: ${email} (name: ${name})`);
    const newUser = { id: Date.now().toString(), email, name };


    // Respond with success (omitting sensitive data like password)
    // In a real app, you might also issue a session token or JWT here.
    return res.status(201).json({
      message: 'User registered successfully!',
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'An unexpected error occurred during registration.' });
  }
}