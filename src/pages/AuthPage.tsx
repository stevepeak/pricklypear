import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotIsLoading, setForgotIsLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const { signIn, signUpWithMagicLink, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate("/threads");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate("/threads");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUpWithMagicLink(email);
      // Optionally, show a message or redirect
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotIsLoading(true);
    setForgotMessage(null);
    setForgotError(null);
    try {
      // Use supabase directly, as useAuth does not expose resetPassword
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/update-password",
      });
      if (error) {
        setForgotError(error.message);
      } else {
        setForgotMessage(
          "If an account with that email exists, a password reset link has been sent.",
        );
      }
    } catch (err) {
      setForgotError("Something went wrong. Please try again later.");
    } finally {
      setForgotIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          🌵 Prickly Pear
        </a>
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {showForgotPassword
                  ? "Reset your password"
                  : isSignUp
                    ? "Create your account"
                    : "Welcome back"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={forgotIsLoading}
                  >
                    {forgotIsLoading ? "Sending..." : "Send reset link"}
                  </Button>
                  {forgotMessage && (
                    <div className="text-green-600 text-center text-sm">
                      {forgotMessage}
                    </div>
                  )}
                  {forgotError && (
                    <div className="text-red-600 text-center text-sm">
                      {forgotError}
                    </div>
                  )}
                  <div className="text-center text-sm mt-2">
                    <a
                      href="#"
                      className="underline underline-offset-4 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowForgotPassword(false);
                      }}
                    >
                      Back to login
                    </a>
                  </div>
                </form>
              ) : (
                <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
                  <div className="grid gap-6">
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
                      {!isSignUp && (
                        <div className="grid gap-2">
                          <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <a
                              href="#"
                              className="ml-auto text-sm underline-offset-4 hover:underline"
                              tabIndex={-1}
                              onClick={(e) => {
                                e.preventDefault();
                                setShowForgotPassword(true);
                              }}
                            >
                              Forgot your password?
                            </a>
                          </div>
                          <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            Password must be at least 8 characters and include
                            at least one lowercase letter, one uppercase letter,
                            and one number.
                          </div>
                        </div>
                      )}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading
                          ? isSignUp
                            ? "Sending magic link..."
                            : "Logging in..."
                          : isSignUp
                            ? "Send magic link"
                            : "Login"}
                      </Button>
                    </div>
                    <div className="text-center text-sm">
                      {isSignUp ? (
                        <>
                          Already have an account?{" "}
                          <a
                            href="#"
                            className="underline underline-offset-4 cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsSignUp(false);
                            }}
                          >
                            Log in
                          </a>
                        </>
                      ) : (
                        <>
                          Don&apos;t have an account?{" "}
                          <a
                            href="#"
                            className="underline underline-offset-4 cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsSignUp(true);
                            }}
                          >
                            Sign up
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
            By clicking Login or Signup, you agree to our{" "}
            <a
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
