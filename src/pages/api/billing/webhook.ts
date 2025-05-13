import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
// import { db } from '@/lib/db'; // Your DB client
import { buffer } from 'micro'; // Helper to read request body as buffer

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for Stripe webhook signature verification
  },
};

// Mock function to update user subscription status in DB
async function updateUserSubscriptionStatus(userId: string, status: string, subscriptionId?: string, planEndsAt?: Date | null, priceId?: string) {
    console.log(`WEBHOOK: Updating user ${userId} subscription. Status: ${status}, SubID: ${subscriptionId}, EndsAt: ${planEndsAt}, PriceID: ${priceId}`);
    // Real implementation:
    // await db.userProfile.update({
    //   where: { userId },
    //   data: {
    //     subscriptionStatus: status,
    //     subscriptionId: subscriptionId || null, // Store Stripe subscription ID
    //     planEndsAt: planEndsAt,
    //     // You might also store the active priceId or plan name
    //   },
    // });
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Webhook Error: Missing stripe-signature or webhook secret.');
    return res.status(400).send('Webhook Error: Missing signature or secret.');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  console.log(`Received Stripe event: ${event.type}`, event.data.object);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription && session.customer && session.metadata?.appUserId) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await updateUserSubscriptionStatus(
            session.metadata.appUserId,
            subscription.status, // e.g., 'active', 'trialing'
            subscription.id,
            subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
            subscription.items.data[0]?.price.id // Get priceId from subscription item
          );
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && invoice.customer && invoice.billing_reason === 'subscription_cycle') {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const appUserId = subscription.metadata.appUserId; // Assuming you set this when creating subscription
          if (appUserId) {
            await updateUserSubscriptionStatus(
              appUserId,
              subscription.status,
              subscription.id,
              subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
              subscription.items.data[0]?.price.id
            );
          }
        }
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': // Handles cancellations
        const subscriptionUpdated = event.data.object as Stripe.Subscription;
        const appUserIdUpdated = subscriptionUpdated.metadata.appUserId;
        if (appUserIdUpdated) {
          await updateUserSubscriptionStatus(
            appUserIdUpdated,
            subscriptionUpdated.status, // e.g., 'active', 'canceled', 'past_due'
            subscriptionUpdated.id,
            subscriptionUpdated.current_period_end ? new Date(subscriptionUpdated.current_period_end * 1000) : null,
            subscriptionUpdated.items.data[0]?.price.id
          );
        }
        break;
        
      // Add other event types you want to handle (e.g., invoice.payment_failed)
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
      console.error("Error processing webhook event:", error);
      // Do not send 500 to Stripe for business logic errors, they might retry.
      // Only send 500 for unexpected server errors.
      // If it's an error you can't recover from, send 200 to acknowledge receipt and prevent retries.
      return res.status(500).json({ message: "Webhook handler failed. Please check logs."});
  }

  res.status(200).json({ received: true });
}