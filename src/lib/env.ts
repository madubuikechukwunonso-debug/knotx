export const env = {
  databaseUrl: process.env.DATABASE_URL || '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000',
  appSecret: process.env.APP_SECRET || 'dev-secret',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  initialAdminEmail: process.env.INITIAL_ADMIN_EMAIL || '',
  initialAdminPassword: process.env.INITIAL_ADMIN_PASSWORD || '',
  initialAdminUsername: process.env.INITIAL_ADMIN_USERNAME || '',
  initialAdminName: process.env.INITIAL_ADMIN_NAME || 'Owner',
};
