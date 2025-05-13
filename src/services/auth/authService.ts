import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/userTypes';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
}

export const authService = {
  /**
   * Sign in a user with email and password
   */
  async signIn({ email, password }: AuthCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Get the user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles') // Use the correct table name as per your generated types
      .select('*')
      .eq('user_id', data.user.id) // Match against the foreign key linking to the user
      .single(); // Fetch a single profile record
    if (profileError) {
      throw new Error(profileError.message);
    }

    // Define your subscription tier union type (if not already defined elsewhere)
      type SubscriptionTier = "free" | "basic" | "premium" | "enterprise";

    // Define an interface for the expected shape with optional subscription fields
    interface ProfileWithSubscriptionInfo {
        subscription_tier?: string; // Keeping this as string for flexibility from DB
        subscription_expiry?: string | null;
        role?: string;
      [key: string]: any; // Allows other properties from the union type
    }

    // Assert profileData to this type for safer access to potential subscription fields
    const typedProfileData = profileData as ProfileWithSubscriptionInfo;

    let determinedTier: SubscriptionTier = 'free'; // Default
    if (typedProfileData.subscription_tier) {
      const tierFromDb = typedProfileData.subscription_tier.toLowerCase();
      if (validTiers.includes(tierFromDb as SubscriptionTier)) { // Check if it's a valid tier
        determinedTier = tierFromDb as SubscriptionTier;
      }
      // Else, it remains 'free' or you could log a warning about an unknown tier
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      name: profileData.display_name || email.split('@')[0],
      avatar: profileData.avatar_url,
        role: (typedProfileData.role as string) || 'user', // Assuming role is also string from DB
      subscription: {
        type: determinedTier, // Use the validated or defaulted tier
        status: typedProfileData.subscription_expiry && new Date(typedProfileData.subscription_expiry) > new Date() 
                  ? 'active' 
                  : 'expired',
        expiresAt: typedProfileData.subscription_expiry ? typedProfileData.subscription_expiry : undefined,
      },
    };
  },

  /**
   * Register a new user
   */
  async register({ email, password, name }: RegisterData): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Create a profile for the new user
    const { error: profileError } = await supabase
      .from('user_profiles') // Use the correct table name as per your generated types
      .insert({
        id: data.user!.id,
        display_name: name,
        subscription_tier: 'free',
        role: 'user',
      });

    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      id: data.user!.id,
      email: data.user!.email!,
      name,
      role: 'user',
      subscription: {
        type: 'free',
        status: 'active',
      },
    };
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Send a password reset email
   */
  async resetPassword({ email }: ResetPasswordData): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Update the user's password
   */
  async updatePassword({ password }: UpdatePasswordData): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    
    if (!data.user) {
      return null;
    }

    // Get the user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles') // Use the correct table name as per your generated types
      .select('*')
      .eq('user_id', data.user.id) // Match against the foreign key linking to the user
      .single(); // Fetch a single profile record
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      name: profileData.display_name || data.user.email!.split('@')[0],
      avatar: profileData.avatar_url,
      role: profileData.role || 'user',
      subscription: {
        type: profileData.subscription_tier || 'free',
        status: profileData.subscription_expiry && new Date(profileData.subscription_expiry) > new Date() ? 'active' : 'expired',
        expiresAt: profileData.subscription_expiry,
      },
    };
  },

  /**
   * Validate if an email is from an allowed domain
   */
  validateEmail(email: string): boolean {
    // First check if the email has a basic valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Reject patterns like "xeds@sjdjsd"
    const invalidPattern = /^[a-z0-9]+@[a-z0-9]+$/i;
    if (invalidPattern.test(email)) {
      return false;
    }

    // Check if it's from a premium domain
    const validDomains = [
      'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
      'protonmail.com', 'aol.com', 'zoho.com', 'mail.com', 'msn.com',
      'live.com', 'yandex.com', 'gmx.com', 'tutanota.com', 'fastmail.com'
    ];
    const domain = email.split('@')[1].toLowerCase();
    return validDomains.includes(domain);
  }
};
