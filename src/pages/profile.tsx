import React, { useState, useEffect, FormEvent } from 'react';
import { loadStripe } from '@stripe/stripe-js';
// Define a type for the profile data on the frontend
interface UserProfileData {
  id?: string;
  userId?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  websiteUrl?: string | null;
  location?: string | null;
  subscriptionStatus?: string | null; // e.g., "free", "active", "trialing", "canceled", "past_due"
  stripeCustomerId?: string | null;
  subscriptionId?: string | null;
  planEndsAt?: string | null; // ISO Date string
  // Add other fields you expect from the API
}

// Make sure your Stripe publishable key is available (e.g., via .env.local)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');


const UserProfilePage: React.FC = () => {
  // const { data: session, status: sessionStatus } = useSession();
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [sessionUser, setSessionUser] = useState<{ name?: string | null; email?: string | null; image?: string | null; id?: string } | null>(null);

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [editableProfile, setEditableProfile] = useState<Partial<UserProfileData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  // Simulate session
  useEffect(() => {
    setTimeout(() => {
      const mockSession = {
        user: { name: 'Demo User', email: 'user@example.com', id: 'mock-user-id', image: 'https://via.placeholder.com/100' },
        expires: 'some-future-date'
      };
      if (mockSession && mockSession.user) {
        setSessionUser(mockSession.user);
        setSessionStatus('authenticated');
      } else {
        setSessionStatus('unauthenticated');
      }
    }, 300);
  }, []);

      const fetchProfile = async () => {
    if (sessionStatus !== 'authenticated') return;
        setIsLoading(true);
        setError(null);
        try {
      // Simulate passing user ID for mock API
      const headers: HeadersInit = {};
      if (process.env.NODE_ENV === 'development' && sessionUser?.id) {
          headers['x-user-id'] = sessionUser.id;
          }
      const response = await fetch('/api/users/profile', { headers });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch profile: ${response.statusText}`);
      }
      const data: UserProfileData = await response.json();
      setProfile(data);
                  setEditableProfile({
        bio: data.bio || '', avatarUrl: data.avatarUrl || '',
        websiteUrl: data.websiteUrl || '', location: data.location || '',
                  });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
};

  useEffect(() => {
    fetchProfile();
  }, [sessionStatus, sessionUser?.id]);

  // Check for Stripe session status from URL (after redirect from Checkout)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('status') === 'success' && query.get('session_id')) {
      setSuccessMessage('Subscription successful! Your profile will update shortly.');
      // Optionally clear query params: window.history.replaceState({}, document.title, "/profile");
      fetchProfile(); // Re-fetch profile to get updated subscription status
    }
    if (query.get('status') === 'cancelled') {
      setError('Subscription process was cancelled.');
      // Optionally clear query params
    }
  }, [sessionUser?.id]); // Re-run if sessionUser changes, to ensure fetchProfile has the ID

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault(); /* ... (same as before) ... */
    setIsLoading(true); setError(null); setSuccessMessage(null);
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (process.env.NODE_ENV === 'development' && sessionUser?.id) {
            headers['x-user-id'] = sessionUser.id;
        }
        const response = await fetch('/api/users/profile', { method: 'PUT', headers, body: JSON.stringify(editableProfile) });
        if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData.message || `Failed to update profile`); }
        const updatedProfile: UserProfileData = await response.json();
        setProfile(updatedProfile);
        setEditableProfile({ bio: updatedProfile.bio || '', avatarUrl: updatedProfile.avatarUrl || '', websiteUrl: updatedProfile.websiteUrl || '', location: updatedProfile.location || '' });
        setSuccessMessage('Profile updated successfully!'); setIsEditing(false);
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  };

  const handleSubscribe = async (priceId: string) => {
    setIsBillingLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      // Simulate passing user ID and email for mock API
      if (process.env.NODE_ENV === 'development' && sessionUser?.id && sessionUser?.email) {
          headers['x-user-id'] = sessionUser.id;
          headers['x-user-email'] = sessionUser.email;
      }

      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers,
        body: JSON.stringify({ priceId }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.message || 'Could not create checkout session.');
      }
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsBillingLoading(true);
    setError(null);
    try {
        const headers: HeadersInit = {};
        if (process.env.NODE_ENV === 'development' && sessionUser?.id) {
            headers['x-user-id'] = sessionUser.id;
        }
        const response = await fetch('/api/billing/create-portal-session', { method: 'POST', headers });
        const data = await response.json();
        if (!response.ok || !data.url) {
            throw new Error(data.message || 'Could not create portal session.');
        }
        window.location.href = data.url; // Redirect to Stripe Customer Portal
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsBillingLoading(false);
    }
  };

  if (sessionStatus === 'loading' || (sessionStatus === 'authenticated' && isLoading && !profile)) {
    return <div className="container mx-auto p-4 text-center">Loading profile...</div>;
  }
  if (sessionStatus === 'unauthenticated') {
    return <div className="container mx-auto p-4 text-center">Please log in to view your profile.</div>;
  }
  if (!profile) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error || 'Could not load profile.'}</div>;
  }

  const isActiveSubscriber = profile.subscriptionStatus === 'active' || profile.subscriptionStatus === 'trialing';

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">User Profile</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your account details and subscription.</p>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMessage}</div>}

      {/* Subscription Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Subscription</h2>
        {isBillingLoading && <p>Processing...</p>}
        {!isBillingLoading && (
          <>
            <p className="mb-1">Status: <span className="font-medium capitalize">{profile.subscriptionStatus || 'Free'}</span></p>
            {profile.planEndsAt && (profile.subscriptionStatus === 'active' || profile.subscriptionStatus === 'trialing') && (
              <p className="text-sm text-gray-600 mb-3">
                Next billing date: {new Date(profile.planEndsAt).toLocaleDateString()}
              </p>
            )}
            {profile.planEndsAt && profile.subscriptionStatus === 'canceled' && (
                <p className="text-sm text-gray-600 mb-3">
                    Access ends: {new Date(profile.planEndsAt).toLocaleDateString()}
                </p>
            )}


            {!isActiveSubscriber && profile.subscriptionStatus !== 'canceled' && (
              <div className="space-y-2 mt-3">
                <p className="text-sm">Upgrade to Premium:</p>
                <button
                  onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID || '')}
                  disabled={!process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm mr-2"
                >
                  Subscribe Monthly
                </button>
                <button
                  onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID || '')}
                  disabled={!process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                >
                  Subscribe Yearly (Save!)
                </button>
              </div>
            )}
            {(isActiveSubscriber || profile.subscriptionStatus === 'canceled' || profile.subscriptionStatus === 'past_due') && profile.stripeCustomerId && (
              <button
                onClick={handleManageSubscription}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Manage Subscription
              </button>
            )}
          </>
        )}
      </div>


      {/* Profile Details Section (same as before) */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <img src={isEditing ? editableProfile.avatarUrl || sessionUser?.image || 'https://via.placeholder.com/100' : profile.avatarUrl || sessionUser?.image || 'https://via.placeholder.com/100'}
               alt="Profile Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"/>
          <div>
            <h2 className="text-2xl font-semibold">{sessionUser?.name || 'User Name'}</h2>
            <p className="text-gray-600">{sessionUser?.email}</p>
          </div>
        </div>
        {!isEditing ? ( <> {/* ... view mode ... */}
            <div className="space-y-3">
              <div><strong className="text-gray-700">Bio:</strong><p className="text-gray-600 whitespace-pre-wrap">{profile.bio || <span className="text-gray-400">No bio set.</span>}</p></div>
              <div><strong className="text-gray-700">Website:</strong><p className="text-gray-600">{profile.websiteUrl ? <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{profile.websiteUrl}</a> : <span className="text-gray-400">Not set.</span>}</p></div>
              <div><strong className="text-gray-700">Location:</strong><p className="text-gray-600">{profile.location || <span className="text-gray-400">Not set.</span>}</p></div>
            </div>
            <button onClick={() => setIsEditing(true)} className="mt-6 w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Edit Profile</button>
        </> ) : ( <form onSubmit={handleSaveChanges} className="space-y-4"> {/* ... edit mode form ... */}
            <div><label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">Avatar URL</label><input type="url" name="avatarUrl" id="avatarUrl" value={editableProfile.avatarUrl || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
            <div><label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label><textarea name="bio" id="bio" value={editableProfile.bio || ''} onChange={handleInputChange} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
            <div><label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">Website URL</label><input type="url" name="websiteUrl" id="websiteUrl" value={editableProfile.websiteUrl || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
            <div><label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label><input type="text" name="location" id="location" value={editableProfile.location || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
            <div className="flex space-x-3">
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" onClick={() => { setIsEditing(false); setEditableProfile({ bio: profile.bio || '', avatarUrl: profile.avatarUrl || '', websiteUrl: profile.websiteUrl || '', location: profile.location || '' }); setError(null); }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
            </div>
        </form> )}
      </div>
    </div>
  );
};

export default UserProfilePage;