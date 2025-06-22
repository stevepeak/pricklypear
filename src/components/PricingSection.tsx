import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  BadgePlus,
  Crown,
  HeartHandshake,
  MessageCircle,
  Sparkle,
  BedDouble,
} from 'lucide-react';

interface PricingSectionProps {
  variant?: 'marketing' | 'billing';
  title?: string;
  subtitle?: string;
  currentPlan?: string | null;
  isLoading?: boolean;
  onUpgrade?: () => void;
  onManageSubscription?: () => void;
  onDowngrade?: () => void;
}

export function PricingSection({
  variant = 'marketing',
  title,
  subtitle,
  currentPlan,
  isLoading = false,
  onUpgrade,
  onManageSubscription,
  onDowngrade,
}: PricingSectionProps) {
  const isBilling = variant === 'billing';
  const isMarketing = variant === 'marketing';

  const defaultTitle = isBilling ? 'Choose Your Plan' : 'Pricing';
  const defaultSubtitle = isBilling
    ? 'Select the plan that best fits your needs'
    : 'Prickly Pear is the only co-parenting app that invites friends, family, kids, and new partners to join your conversations free. Start your Prickly Pro account today and get AI assisting your conversation to foster healthy relationships and improved co-parenting.';

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">{title || defaultTitle}</h2>
          <p className="text-muted-foreground">{subtitle || defaultSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cacti Family Plan */}
          <Card className="relative">
            {isBilling && !currentPlan && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-accent">
                Current Plan
              </Badge>
            )}
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <HeartHandshake className="h-8 w-8 text-red-700" />
              </div>
              <CardTitle className="text-xl">Cacti Family</CardTitle>
              <div className="text-3xl font-bold">Free</div>
              <p className="text-sm text-muted-foreground">
                Great for friends, family, kids, and new partners
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span>Join conversations of Prickly Pros</span>
                </li>
              </ul>

              {isMarketing ? (
                <Button asChild className="w-full" variant="accent">
                  <Link to="/auth?mode=signup">Join the Cacti Family</Link>
                </Button>
              ) : isBilling ? (
                !currentPlan ? (
                  <Button disabled className="w-full" variant="ghost">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={onDowngrade}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Downgrade to Cacti Family'}
                  </Button>
                )
              ) : null}

              <p className="text-sm text-muted-foreground">
                <strong>Why?</strong> It's often we need family, friends, kids,
                and new partners to join our conversations. Invite your family
                to join your threads for safe, secure, and accountable
                conversations.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Important:</strong> Primary parents must subscribe to
                Prickly Pro. The Cacti Family is designed only for secondary
                users.
              </p>
            </CardContent>
          </Card>

          {/* Prickly Pro Plan */}
          <Card className="relative">
            {isBilling && currentPlan && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Current Plan
              </Badge>
            )}
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
                  <span>Create unlimited threads, events, and files</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkle className="h-4 w-4 text-green-500" />
                  <span>
                    AI-powered chat with your threads, files, and events
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-green-500" />
                  <span>
                    Better sleep knowing AI will mediate conversations
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-green-500" />
                  <span>Invite Cacti Family members to join threads</span>
                </li>
              </ul>

              {isMarketing ? (
                <Button asChild className="w-full" variant="success">
                  <Link to="/auth?mode=signup">Start Your Free Trial</Link>
                </Button>
              ) : isBilling ? (
                currentPlan ? (
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={onManageSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Manage Subscription'}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={onUpgrade}
                    disabled={isLoading}
                    variant="success"
                  >
                    {isLoading ? 'Loading...' : 'Upgrade to Prickly Pro'}
                  </Button>
                )
              ) : null}
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
}
