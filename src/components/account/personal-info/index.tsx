import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type FormValues, type PersonalInfoFormProps } from './types';
import React from 'react';
import { updatePersonalInfo } from './update';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function PersonalInfoForm(props: PersonalInfoFormProps) {
  const { form, profileLoading, onProfileUpdated } = props;
  const [isLoading, setIsLoading] = React.useState(false);
  const [emailUpdating, setEmailUpdating] = React.useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] =
    React.useState(false);
  const { theme, setTheme } = useTheme();

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setEmailUpdating(false);
    setEmailConfirmationSent(false);
    try {
      await updatePersonalInfo({
        name: data.name,
        email: data.email,
      });
      toast('Profile updated', {
        description: 'Your profile information has been updated successfully.',
      });
      if (onProfileUpdated) onProfileUpdated();
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string' &&
        (error as { message: string }).message.includes('confirmation')
      ) {
        setEmailConfirmationSent(true);
        toast('Email update initiated', {
          description:
            'A confirmation link has been sent to your new email. Please check your inbox to confirm the change.',
        });
      } else {
        toast('Update failed', {
          description: 'There was a problem updating your profile.',
        });
      }
    } finally {
      setIsLoading(false);
      setEmailUpdating(false);
    }
  };

  return (
    <>
      {profileLoading ? (
        <div className="flex justify-center py-4">
          Loading profile information...
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed on your profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your email address"
                      type="email"
                      autoComplete="email"
                      {...field}
                      disabled={emailUpdating}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the email used to sign in. Changing your email will
                    require confirmation.
                  </FormDescription>
                  <FormMessage />
                  {emailConfirmationSent && (
                    <div className="text-sm text-muted-foreground mt-2">
                      A confirmation link has been sent to your new email.
                      Please check your inbox.
                    </div>
                  )}
                </FormItem>
              )}
            />
            {/* Language Selector Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <LanguageSelector />
              <FormDescription>
                Change the language in Prickly Pear. This does not affect thread
                messages.
              </FormDescription>
            </div>
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <RadioGroup
                value={theme}
                onValueChange={setTheme}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <label
                    htmlFor="light"
                    className="flex items-center cursor-pointer"
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <label
                    htmlFor="dark"
                    className="flex items-center cursor-pointer"
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <label
                    htmlFor="system"
                    className="flex items-center cursor-pointer"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                  </label>
                </div>
              </RadioGroup>
              <FormDescription>
                Choose your preferred theme. System will match your operating
                system's theme.
              </FormDescription>
            </div>
            <Button
              variant="success"
              type="submit"
              disabled={isLoading || emailUpdating}
            >
              {isLoading || emailUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}
