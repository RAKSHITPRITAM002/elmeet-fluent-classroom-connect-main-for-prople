// This could also be an environment variable, e.g., process.env.ALLOWED_EMAIL_DOMAINS.split(',')
export const ALLOWED_EMAIL_DOMAINS: string[] = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com', // Added yahoo as it's a major provider
  'aol.com',   // Added AOL
  'icloud.com', // Apple's email
  // Add any other domains you consider "premium" or widely used personal email providers
  // For corporate/educational use, you might have a different list or logic
];

export const isPremiumDomain = (email: string): boolean => {
  if (!email || !email.includes('@')) {
    return false;
  }
  const domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
};