import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Lock, CircleCheck } from "lucide-react";
import Footer from "@/components/ui/footer";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto max-w-4xl text-center py-20 px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI-assisted, Co-Parenting Communication
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Transform challenging conversations into productive dialogue. Our
            platform helps you communicate more effectively, reducing conflict
            and keeping conversations on topic.
          </p>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            <Link to="/auth">Get Started Today</Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600">
              Built specifically for modern co-parenting challenges
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              title="Smart Messaging"
              icon={<CircleCheck size={40} className="text-green-600" />}
              description="AI-powered suggestions help you communicate more clearly and reduce misunderstandings before they happen."
            />
            <FeatureCard
              title="Organized Conversations"
              icon={<MessageSquare size={40} className="text-blue-600" />}
              description="Keep discussions organized by topic - school, health, activities, and more. Never lose track of important decisions."
            />
            <FeatureCard
              title="Private & Secure"
              icon={<Lock size={40} className="text-purple-600" />}
              description="Your family's conversations stay private with enterprise-grade security and end-to-end encryption."
            />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Improve Your Co-Parenting Communication?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of parents who have transformed their communication
            and created better outcomes for their children.
          </p>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            <Link to="/auth">Start Your Free Trial</Link>
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
  <div className="text-center p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Home;
