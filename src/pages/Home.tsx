import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Lock,
  HeartHandshake,
  MessageCircle,
  UsersRound,
  TriangleAlert,
  BadgePlus,
  BatteryFull,
  Crown,
} from "lucide-react";
import Footer from "@/components/ui/footer";

const PricingSection = () => (
  <div className="flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-4xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Transparent Pricing</h2>
        <p className="text-muted-foreground">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Cacti Family Plan */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <HeartHandshake className="h-8 w-8 text-red-700" />
            </div>
            <CardTitle className="text-xl">Cacti Family</CardTitle>
            <div className="text-3xl font-bold">Free</div>
            <p className="text-sm text-muted-foreground">
              Join conversation of other Prickly Pro members.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-500" />
                <span>Join conversations of others</span>
              </li>
              <li className="flex items-center gap-2">
                <UsersRound className="h-4 w-4 text-green-500" />
                <span>Great for friends, family, kids, and new partners</span>
              </li>
              <li className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-red-500" />
                <span>Cannot create threads, events, or files</span>
              </li>
            </ul>
            <Button asChild className="w-full" variant="success">
              <Link to="/auth?mode=signup">Get started for free</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Prickly Pro Plan */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Crown className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-xl">Prickly Pro</CardTitle>
            <div className="text-3xl font-bold">
              $15<span className="text-lg font-normal">/month</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Full access to all features
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <BadgePlus className="h-4 w-4 text-green-500" />
                <span>Create AI-powered threads, events, and files</span>
              </li>
              <li className="flex items-center gap-2">
                <BatteryFull className="h-4 w-4 text-green-500" />
                <span>Unlimited usage</span>
              </li>
              <li className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-green-500" />
                <span>
                  Invite Cacti Family members to join your threads, free
                </span>
              </li>
            </ul>
            <Button asChild className="w-full" variant="success">
              <Link to="/auth?mode=signup">Get started for free</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          All plans include secure, encrypted messaging and data protection.
        </p>
        <p>
          You can upgrade, downgrade, or cancel your subscription at any time.
        </p>
      </div>
    </div>
  </div>
);

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-14 p-2 flex items-center">
        <div
          className="inline-block w-8 h-8 bg-[url('../public/logo.png')] bg-center bg-cover bg-no-repeat"
          role="img"
          aria-label="Cactus"
        />
        <span className="text-1xl font-bold ">Prickly Pear</span>
      </div>
      {/* Hero Section with Background Image */}
      <div className="relative w-full min-h-[65vh] bg-[url('../public/jumbo.png')] bg-center bg-cover bg-no-repeat">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/15"></div>

        {/* Content */}
        <div className="relative container mx-auto max-w-4xl text-center py-10 px-4">
          <h1 className="text-3xl text-white max-w-2xl mx-auto mb-4">
            AI-powered, co-parenting communication.
          </h1>
          <Button
            asChild
            className="bg-[#D97D54] hover:bg-[#C96B3F] text-white px-8 shadow-lg border-2 border-[#E2B07A]"
          >
            <Link to="/auth?mode=signup">Get Started For Free</Link>
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

      {/* Pricing Section */}
      <PricingSection />

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
            className="bg-[#D97D54] hover:bg-[#C96B3F] text-white px-8 py-3 shadow-lg border-2 border-[#E2B07A]"
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
