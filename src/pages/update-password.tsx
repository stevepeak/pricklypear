import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordSchema } from '@/types/schemas';
import { handleError } from '@/services/messageService/utils';
import { isWeb } from '@/utils/platform';

const passwordSchema = z
  .object({
    newPassword: PasswordSchema,
    confirmNewPassword: PasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const UpdatePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      if (updateError) {
        setError(updateError.message);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: (await supabase.auth.getUser()).data.user?.email || '',
          password: data.newPassword,
        });
        if (signInError) {
          setError(signInError.message);
        } else {
          setMessage(
            'Your password has been updated and you have been logged in.'
          );
          if (isWeb()) {
            window.location.href = '/threads';
          }
        }
      }
    } catch (err) {
      handleError(err, 'updatePassword');
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          🌵 Prickly Pear
        </a>
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Set a new password</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-6"
              >
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    {...form.register('newPassword')}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmNewPassword">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    autoComplete="new-password"
                    {...form.register('confirmNewPassword')}
                  />
                </div>
                <Button
                  variant="accent"
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update password'}
                </Button>
                {message && (
                  <div className="text-green-600 text-center text-sm">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="text-red-600 text-center text-sm">
                    {error}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
            <a href="/auth">Back to login</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
