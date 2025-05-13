import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe'; // Your Stripe client
// import { getSession } from 'next-auth/react'; // Or your auth method to get user ID & email
// import { db } from '@/lib/db'; // Your DB client (e.g., Prisma)

// Mock function to get user details, replace with your actual auth logic
async function getAuthenticatedUserDetails(req: NextApiRequest): Promise<{ userId: string; email: string; stripeCustomerId?: string | null } | null> {
    // const session = await getSession({ req });
    // if (!session?.user?.id || !session?.user?.email) return null;
    // const userProfile = await db.userProfile.findUnique({ where: { userId: session.user.id }});
    // return { userId: session.user.id, email: session.user.email, stripeCustomerId: userProfile?.stripeCustomerId };

    // Mock implementation:
    const userId = req.headers['x-user-id'] as string || 'mock-user-id'; // Simulate getting userId
    const userEmail = req.headers['x-user-email'] as string || 'user@example.com'; // Simulate getting userEmail
    // Simulate fetching stripeCustomerId from a mock profile
    const mockProfile = { userId: 'mock-user-id', stripeCustomerId: 'cus_mockcustomerid' }; // Example
    const stripeCustomerId = userId === mockProfile.userId ? mockProfile.stripeCustomerId : null;

    if (userId && userEmail) {
        return { userId, email: userEmail, stripeCustomerId };
    }
    return null;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const userDetails = await getAuthenticatedUserDetails(req);
    if (!userDetails) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { priceId } = req.body; // Price ID of the plan the user wants to subscribe to
    if (!priceId || typeof priceId !== 'string') {
      return res.status(400).json({ message: 'Price ID is required.' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let stripeCustomerId = userDetails.stripeCustomerId;

    // 1. Create or retrieve Stripe Customer
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userDetails.email,
        metadata: {
          appUserId: userDetails.userId, // Link Stripe customer to your app's user ID
        },
      });
      stripeCustomerId = customer.id;
      // Save stripeCustomerId to your UserProfile in the database
      // await db.userProfile.update({
      //   where: { userId: userDetails.userId },
      //   data: { stripeCustomerId },
      // });
      console.log(`Created Stripe customer ${stripeCustomerId} for user ${userDetails.userId}`);
      // For mock:
      // mockUserProfiles[userDetails.userId].stripeCustomerId = stripeCustomerId;
    }

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription', // For recurring subscriptions
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/profile?session_id={CHECKOUT_SESSION_ID}&status=success`, // Redirect on success
      cancel_url: `${appUrl}/profile?status=cancelled`,        // Redirect on cancellation
      // Optionally pass metadata to the session, which can be retrieved via webhooks
      metadata: {
        appUserId: userDetails.userId,
        priceId: priceId,
      }
    });

    if (!session.url) {
        return res.status(500).json({ message: 'Could not create Stripe session URL.'});
    }

    return res.status(200).json({ sessionId: session.id, url: session.url });

  } catch (error: any) {
    console.error('Stripe Checkout Session Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}