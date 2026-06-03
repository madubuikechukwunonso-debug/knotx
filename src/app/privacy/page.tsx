'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="px-6 pb-20 pt-24 lg:pt-32">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12">
            <Link href="/" className="text-sm text-black/50 hover:text-black">← Back to home</Link>
            <h1 className="mt-6 font-serif text-5xl font-light tracking-tight">Privacy Policy</h1>
            <p className="mt-3 text-sm text-black/50">Last updated: June 3, 2026</p>
          </div>

          <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-black/80">
            <p>
              KNOTXANDKRAFTS ("we", "us", or "our") respects your privacy and is committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, 
              book appointments, or sign in using Google.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, information we receive automatically, and information from third-party services (including Google Sign-In).
            </p>
            <ul>
              <li><strong>Account Information:</strong> When you create an account or sign in with Google, we collect your name, email address, and profile picture.</li>
              <li><strong>Booking Information:</strong> Service selections, appointment dates/times, braider preferences, notes, and payment details (processed securely via Stripe).</li>
              <li><strong>Google User Data:</strong> When you choose to sign in with Google, we request the following scopes: <code>openid email profile</code>. This allows us to access your Google email address, full name, and profile picture.</li>
            </ul>

            <h2 className="font-serif text-2xl mt-12 mb-4">2. How We Use Google User Data (Data Accessed &amp; Usage)</h2>
            <p>
              We access the following Google user data when you sign in with Google:
            </p>
            <ul>
              <li><strong>Email address</strong> — used as your primary login identifier and to send booking confirmations, reminders, and important account notifications.</li>
              <li><strong>Name / Display Name</strong> — used to personalize your experience, display your name in bookings and your account dashboard, and for staff to identify you during appointments.</li>
              <li><strong>Profile Picture</strong> — optionally displayed in your account profile for a personalized experience.</li>
            </ul>
            <p>
              <strong>Purpose:</strong> We use this data solely to create and authenticate your account, enable seamless booking of luxury braiding appointments, 
              provide personalized service, and communicate important information about your bookings. We do not use Google user data for advertising or marketing purposes.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">3. Data Sharing</h2>
            <p>
              We do <strong>not</strong> sell or rent your personal information. We share limited information only with trusted service providers necessary to operate our business:
            </p>
            <ul>
              <li><strong>Stripe</strong> — for processing deposits and payments (we do not store full card details).</li>
              <li><strong>Vercel</strong> — our hosting and deployment platform.</li>
              <li><strong>Email / Communication providers</strong> — to send transactional booking emails and reminders.</li>
              <li><strong>Database &amp; Infrastructure providers</strong> — for securely storing user and booking data.</li>
            </ul>
            <p>
              We only share the minimum data necessary and require these providers to protect your information.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">4. Data Storage &amp; Protection</h2>
            <p>
              Your data is stored securely in our database. We use industry-standard security practices including:
            </p>
            <ul>
              <li>HTTPS encryption for all data in transit</li>
              <li>Secure server infrastructure with restricted access</li>
              <li>Regular security reviews of our codebase and dependencies</li>
            </ul>
            <p>
              While we implement strong safeguards, no method of transmission over the Internet is 100% secure. We continuously work to protect your information.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">5. Data Retention &amp; Deletion</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide our services and comply with legal obligations.
            </p>
            <p>
              <strong>How to request deletion:</strong> You may request deletion of your personal data (including data obtained via Google Sign-In) at any time by emailing{' '}
              <a href="mailto:hello@knotxandkrafts.com" className="text-emerald-600 hover:underline">hello@knotxandkrafts.com</a>. 
              We will respond to verified requests within a reasonable timeframe and delete your data, except where we are legally required to retain certain information (e.g., for tax or fraud prevention purposes).
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">Your Rights</h2>
            <p>
              Depending on your location, you may have the right to access, correct, or delete your personal information. 
              You can manage your account information directly in the Account section after logging in, or contact us for assistance.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page with a new "Last updated" date.
            </p>

            <h2 className="font-serif text-2xl mt-12 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or how we handle your data (including Google user data), please contact us at:{' '}
              <a href="mailto:hello@knotxandkrafts.com" className="text-emerald-600 hover:underline">hello@knotxandkrafts.com</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
