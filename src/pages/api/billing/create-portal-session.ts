import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe';
// import { getSession } from 'next-auth/react';
// import { db } from '@/lib/db';

// Mock function to get user details, replace with your actual auth logic
async function getAuthenticatedUserStripeId(req: NextApiRequest): Promise<string | null> {
    // const session = await getSession({ req });
    // if (!session?.user?.id) return null;
    // const userProfile = await db.userProfile.findUnique({ where: { userId: session.user.id }, select: { stripeCustomerId: true }});
    // return userProfile?.stripeCustomerId || null;

    // Mock implementation:
    const userId = req.headers['x-user-id'] as string || 'mock-user-id';
    const mockProfile = { userId: 'mock-user-id', stripeCustomerId: 'cus_mockcustomerid' }; // Ensure this cus_ ID is valid in your Stripe test data
    return userId === mockProfile.userId ? mockProfile.stripeCustomerId : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const stripeCustomerId = await getAuthenticatedUserStripeId(req);
        if (!stripeCustomerId) {
            return res.status(401).json({ message: 'User not found or not linked to Stripe.' });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${appUrl}/profile`, // URL to redirect after portal session
        });

        if (!portalSession.url) {
            return res.status(500).json({ message: 'Could not create Stripe portal session URL.'});
        }

        return res.status(200).json({ url: portalSession.url });

    } catch (error: any) {
        console.error('Stripe Portal Session Error:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
}