import React from 'react';
import Footer from '@/components/ui/footer';

export default function PrivacyPolicy() {
  return (
    <>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">
          Your privacy is important to us at Prickly Pear. Here is our
          commitment to you:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>We never sell or share your data, ever.</li>
          <li>
            We never store your original message, only the AI rephrased one you
            accept.
          </li>
        </ul>
        <p>If you have any questions about this policy, please contact us.</p>
      </div>
      <Footer />
    </>
  );
}
