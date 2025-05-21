import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordSchema } from "@/types/schemas";
import { type FormValues, type PersonalInfoFormProps } from "./types";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { updatePersonalInfo } from "./update";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { updatePassword } from "./update";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const changePasswordFormSchema = z
  .object({
    currentPassword: PasswordSchema,
    newPassword: PasswordSchema,
    confirmNewPassword: PasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type PasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export function PersonalInfoForm(props: PersonalInfoFormProps) {
  const { form, profileLoading, onProfileUpdated } = props;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [emailUpdating, setEmailUpdating] = React.useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] =
    React.useState(false);

  // Password form state
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setEmailUpdating(false);
    setEmailConfirmationSent(false);
    try {
      await updatePersonalInfo({
        name: data.name,
        email: data.email,
      });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      if (onProfileUpdated) onProfileUpdated();
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string" &&
        (error as { message: string }).message.includes("confirmation")
      ) {
        setEmailConfirmationSent(true);
        toast({
          title: "Email update initiated",
          description:
            "A confirmation link has been sent to your new email. Please check your inbox to confirm the change.",
        });
      } else {
        toast({
          title: "Update failed",
          description: "There was a problem updating your profile.",
        });
      }
    } finally {
      setIsLoading(false);
      setEmailUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setPasswordLoading(true);
    try {
      await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast({
        title: "Password was updated",
        description: "Your password has been changed successfully.",
      });
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Password update failed",
        description:
          error instanceof Error
            ? error.message
            : "There was a problem updating your password.",
      });
    } finally {
      setPasswordLoading(false);
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
            <Button type="submit" disabled={isLoading || emailUpdating}>
              {isLoading || emailUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      )}
      {profileLoading ? null : (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-2">Change Password</h2>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4 max-w-md"
              autoComplete="off"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters and include at
                      least one lowercase letter, one uppercase letter, and one
                      number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Updating..." : "Change Password"}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </>
  );
}
