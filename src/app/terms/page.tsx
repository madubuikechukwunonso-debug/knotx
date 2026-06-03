'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="px-6 pb-20 pt-24 lg:pt-32">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12">
            <Link href="/" className="text-sm text-black/50 hover:text-black">← Back to home</Link>
            <h1 className="mt-6 font-serif text-5xl font-light tracking-tight">Terms of Service</h1>
            <p className="mt-3 text-sm text-black/50">Last updated: June 3, 2026</p>
          </div>

          <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-black/80">
            <p>
              Welcome to KNOTXANDKRAFTS. By accessing or using our website, booking system, or services, you agree to be bound by these Terms of Service ("Terms"). 
              Please read them carefully.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">1. Our Services</h2>
            <p>
              KNOTXANDKRAFTS provides a platform to discover, book, and manage luxury hair braiding appointments and purchase curated hair care products. 
              Our services include online booking, appointment management, and an online shop.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">2. User Accounts</h2>
            <p>
              You may create an account or sign in using Google. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. 
              You agree to provide accurate and complete information when creating your account.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">3. Bookings, Deposits &amp; Cancellations</h2>
            <ul>
              <li>A non-refundable deposit is required to secure your appointment (typically 30% of the service price).</li>
              <li>Deposits are paid via our secure Stripe checkout and are applied toward the final service cost.</li>
              <li>Cancellations made more than 48 hours before the appointment may be eligible for rescheduling (subject to availability). Deposits are generally non-refundable.</li>
              <li>No-shows or late cancellations (less than 48 hours) will forfeit the deposit.</li>
              <li>We reserve the right to refuse service or cancel appointments at our discretion.</li>
            </ul>

            <h2 className="font-serif text-2xl mt-12 mb-4">4. Payments</h2>
            <p>
              All payments are processed securely through Stripe. We do not store your full credit card information on our servers. 
              You agree to pay all charges associated with your bookings, including applicable taxes.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">5. User Conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use the service for any unlawful purpose</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the integrity or performance of the platform</li>
              <li>Attempt to gain unauthorized access to any part of the system</li>
            </ul>

            <h2 className="font-serif text-2xl mt-12 mb-4">6. Intellectual Property</h2>
            <p>
              All content on this website, including text, images, logos, and design, is the property of KNOTXANDKRAFTS or its content suppliers and is protected by intellectual property laws. 
              You may not reproduce, distribute, or create derivative works without our prior written permission.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, KNOTXANDKRAFTS shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
              or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul>
              <li>Your use or inability to use the service</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
              <li>Any interruption or cessation of transmission to or from the service</li>
            </ul>

            <h2 className="font-serif text-2xl mt-12 mb-4">8. Disclaimer</h2>
            <p>
              Our services are provided "as is" and "as available" without warranties of any kind, either express or implied. 
              We do not warrant that the service will be uninterrupted, secure, or error-free.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which KNOTXANDKRAFTS operates, 
              without regard to its conflict of law provisions.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will post the revised Terms on this page with an updated date. 
              Your continued use of the service after changes constitutes acceptance of the new Terms.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:hello@knotxandkrafts.com" className="text-emerald-600 hover:underline">hello@knotxandkrafts.com</a>.
            </p>

            <div className="mt-16 border-t pt-8 text-sm text-black/50">
              By using KNOTXANDKRAFTS, you acknowledge that you have read, understood, and agree to these Terms of Service and our{' '}
              <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
