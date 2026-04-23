import Stripe from 'stripe';
import { env } from './env';

export function getStripe() {
  if (!env.stripeSecretKey) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(env.stripeSecretKey);
}
