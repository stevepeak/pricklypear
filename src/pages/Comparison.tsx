import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Footer from '@/components/ui/footer';
import ComparisonTable from '@/components/ComparisonTable';

const Comparison = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-14 p-2 flex items-center">
        <Link to="/" className="flex items-center">
          <div
            className="inline-block w-8 h-8 bg-[url('/logo.png')] bg-center bg-cover bg-no-repeat"
            role="img"
            aria-label="Cactus"
          />
          <span className="text-1xl font-bold">Prickly Pear</span>
        </Link>
      </div>

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Call to Action */}
      <div className="bg-[#F7C873]/40 py-16">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-[#7C4A03] mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-[#7C4A03]/80 mb-8 max-w-2xl mx-auto">
            Experience the difference AI-powered co-parenting communication can
            make.
          </p>
          <Button
            asChild
            variant="success"
            size="lg"
            className="text-lg px-8 py-4 h-auto"
          >
            <Link to="/auth?mode=signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Comparison;
