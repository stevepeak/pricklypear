import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(() => {
    const mode = searchParams.get('mode');
    const signup = searchParams.get('signup');
    return mode === 'signup' || signup === 'true';
  });
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const { sendMagicLink, signInWithPassword, user } = useAuth();
  const navigate = useNavigate();
  const [invitedEmail, setInvitedEmail] = useState(searchParams.get('email'));
  const inviterName = searchParams.get('inviterName');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/threads');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendMagicLink(email);
      setMagicLinkSent(true);
    } catch (error) {
      logger.error('Auth error', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-primary-foreground bg-[url('/login.png')] bg-cover bg-center bg-no-repeat">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className={cn('flex flex-col gap-6')}>
          {invitedEmail ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  Welcome to The Prickly Pear!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-base mb-4">
                  <strong>{inviterName ?? 'A friend'}</strong> has invited you
                  to join them on Prickly Pear — your AI-assisted parenting
                  communication app.
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Signing up with:{' '}
                  <span className="font-medium">{invitedEmail}</span>
                </div>
                <Button
                  variant="accent"
                  className="w-full mt-4"
                  onClick={async () => {
                    setEmail(invitedEmail);
                    setIsLoading(true);
                    try {
                      await sendMagicLink(invitedEmail);
                      setMagicLinkSent(true);
                    } catch (error) {
                      logger.error('Signup error', error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  Sign Up
                </Button>
                <div className="text-center text-xs text-muted-foreground mt-6">
                  Already have an account?{' '}
                  <a
                    href="#"
                    className="underline underline-offset-4"
                    onClick={(e) => {
                      e.preventDefault();
                      setInvitedEmail(null);
                      setEmail(invitedEmail);
                    }}
                  >
                    Sign in
                  </a>
                </div>
                <div className="text-center text-xs text-muted-foreground mt-6">
                  <a href="/" className="underline underline-offset-4">
                    Learn more about Prickly Pear
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : magicLinkSent ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl" role="heading">
                  Check your email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-base mb-4">
                  We sent a magic link to{' '}
                  <span className="font-semibold">{email}</span>.<br />
                  Please check your inbox and click the link to complete your
                  sign in.
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Important:</strong> You must click the link in
                    your email to complete the login process.
                  </p>
                </div>
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Didn&apos;t get the email?{' '}
                  <a
                    href="#"
                    className="underline underline-offset-4 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setMagicLinkSent(false);
                    }}
                  >
                    Try again
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl" role="heading">
                    {isSignUp ? 'Join Prickly Pear' : 'Sign in to Prickly Pear'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAuth}>
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                          {isSignUp
                            ? "We'll send you a secure magic link to get started. No password needed!"
                            : "We'll send you a secure magic link to sign in. No password needed!"}
                        </p>
                      </div>
                      <Button
                        variant="accent"
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading
                          ? 'Sending magic link...'
                          : isSignUp
                            ? 'Join The Prickly Pear'
                            : 'Continue with Email'}
                      </Button>
                      <div className="text-center text-sm">
                        {isSignUp ? (
                          <>
                            Already have an account?{' '}
                            <a
                              href="#"
                              className="underline underline-offset-4 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                setIsSignUp(false);
                              }}
                            >
                              Sign in
                            </a>
                          </>
                        ) : (
                          <>
                            Don&apos;t have an account?{' '}
                            <a
                              href="#"
                              className="underline underline-offset-4 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                setIsSignUp(true);
                              }}
                            >
                              Join now
                            </a>
                          </>
                        )}
                      </div>
                      {import.meta.env.DEV && (
                        <div className="border-t pt-4">
                          <div className="text-xs text-muted-foreground mb-2 text-center">
                            Dev Mode - Quick Login
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { email: 'alice@example.com', name: 'Alice' },
                              { email: 'bob@example.com', name: 'Bob' },
                              { email: 'charlie@example.com', name: 'Charlie' },
                              { email: 'dana@example.com', name: 'Dana' },
                              {
                                email: 'support@system.local',
                                name: 'Support (Admin)',
                              },
                            ].map((user) => (
                              <Button
                                key={user.email}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  setIsLoading(true);
                                  try {
                                    await signInWithPassword(
                                      user.email,
                                      'DemoPass1!'
                                    );
                                  } catch (error) {
                                    logger.error('Dev login error', error);
                                  } finally {
                                    setIsLoading(false);
                                  }
                                }}
                                disabled={isLoading}
                              >
                                {user.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
              <div className="text-balance text-center text-xs text-white [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                By clicking {isSignUp ? 'Join' : 'Continue'}, you agree to our{' '}
                <a
                  href="/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
                .
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
