import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Lock, MessageSquare } from 'lucide-react';
import Footer from '@/components/ui/footer';
import { PricingSection } from '@/components/PricingSection';
import ComparisonTable from '@/components/ComparisonTable';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-14 p-2 flex items-center">
        <div
          className="inline-block w-8 h-8 bg-[url('/public/logo.png')] bg-center bg-cover bg-no-repeat"
          role="img"
          aria-label="Cactus"
        />
        <span className="text-1xl font-bold ">Prickly Pear</span>
      </div>
      {/* Hero Section with Background Image */}
      <div className="relative w-full min-h-[65vh] bg-[url('/public/jumbo.png')] bg-center bg-cover bg-no-repeat">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/15"></div>

        {/* Content */}
        <div className="relative container mx-auto max-w-4xl text-center py-10 px-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl text-white max-w-4xl mx-auto mb-6 font-bold leading-tight">
            AI-powered, co-parenting communication.
          </h1>
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

      {/* Features Section */}
      <div className="bg-[#FFF8F0] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-lg text-[#7C4A03]/80">
              <strong>AI is deeply rooted</strong> in every feature of Prickly
              Pear to encourage healthy communication and productive
              co-parenting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              title="Smart Messaging"
              icon={<span className="text-[#3B7A57]">🌵</span>}
              description="AI-powered suggestions help you communicate with clarity and kindness—just like a cactus, strong yet gentle."
            />
            <FeatureCard
              title="Organized Conversations"
              icon={<MessageSquare size={40} className="text-[#D97D54]" />}
              description="Keep every topic—school, health, activities—neatly organized, like rows of desert blooms."
            />
            <FeatureCard
              title="Private & Secure"
              icon={<Lock size={40} className="text-[#7C4A03]" />}
              description="Your family's conversations are protected, as safe as a desert oasis."
            />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Pricing Section */}
      <PricingSection variant="marketing" />

      {/* Call to Action */}
      <div className="bg-[#F7C873]/40 py-16">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-[#7C4A03] mb-4">
            Join the community.
          </h2>
          <p className="text-lg text-[#7C4A03]/80 mb-8 max-w-2xl mx-auto">
            With the Prickly Pear you too can improve your communication so your
            children thrive.
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

const FeatureCard = ({
  title,
  icon,
  description,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
}) => (
  <div className="text-center p-6 rounded-xl border border-[#E2B07A] bg-[#FFF8F0] shadow-md flex flex-col items-center">
    <div className="flex justify-center mb-4 text-4xl">{icon}</div>
    <h3 className="text-xl font-semibold text-[#7C4A03] mb-3">{title}</h3>
    <p className="text-[#7C4A03]/80">{description}</p>
  </div>
);

export default Home;
