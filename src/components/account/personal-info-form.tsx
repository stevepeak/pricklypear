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
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import { FormValues } from "./account-types";
import { UseFormReturn } from "react-hook-form";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";

interface PersonalInfoFormProps {
  form: UseFormReturn<FormValues>;
  profileLoading: boolean;
  onProfileUpdated?: () => void;
}

export function PersonalInfoForm(props: PersonalInfoFormProps) {
  const { form, profileLoading, onProfileUpdated } = props;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [emailUpdating, setEmailUpdating] = React.useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] =
    React.useState(false);
  const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);

  const handleEmojiSelect = (emoji: { native: string }) => {
    setSelectedEmoji(emoji.native);
    setShowEmojiPicker(false);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setEmailUpdating(false);
    setEmailConfirmationSent(false);
    const user = await requireCurrentUser();
    try {
      // Update user metadata (full name)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { name: data.name },
      });
      if (metadataError) throw metadataError;
      // Update email if changed
      if (data.email !== user.email) {
        setEmailUpdating(true);
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        setEmailUpdating(false);
        if (emailError) throw emailError;
        setEmailConfirmationSent(true);
        toast({
          title: "Email update initiated",
          description:
            "A confirmation link has been sent to your new email. Please check your inbox to confirm the change.",
        });
      }
      // Also update the profile name and emoji for consistency
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name: data.name, profile_emoji: selectedEmoji })
        .eq("id", user.id);
      if (profileError) throw profileError;
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      if (onProfileUpdated) onProfileUpdated();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
      });
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
            <FormLabel>Avatar Emoji</FormLabel>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedEmoji ? (
                  <span
                    className="text-3xl cursor-pointer"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Click to change your emoji"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        setShowEmojiPicker(!showEmojiPicker);
                    }}
                    aria-label="Change avatar emoji"
                  >
                    {selectedEmoji}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No emoji selected
                  </span>
                )}
              </div>
              {showEmojiPicker && (
                <Picker data={emojiData} onEmojiSelect={handleEmojiSelect} />
              )}
            </div>
            <Button type="submit" disabled={isLoading || emailUpdating}>
              {isLoading || emailUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}
