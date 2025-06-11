import React from 'react';
import Footer from '@/components/ui/footer';

export default function TermsOfService() {
  return (
    <>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
        <p className="mb-4">
          Welcome to Prickly Pear. By using our service, you agree to the
          following:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>We never sell or share your data, ever.</li>
          <li>
            We never store your original message, only the AI rephrased one you
            accept.
          </li>
        </ul>
        <p>If you have any questions about these terms, please contact us.</p>
      </div>
      <Footer />
    </>
  );
}
