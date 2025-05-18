import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MessageSquareText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import { getUserProfile, requireCurrentUser } from "@/utils/authCache";

const formSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("A valid email is required"),
});

type FormValues = z.infer<typeof formSchema>;

const Account = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [_, setMounted] = useState(false);
  const [messageTone, setMessageTone] = useState<string>("friendly");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emailUpdating, setEmailUpdating] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);

  // Form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Handle theme change
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile data and preferences when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = await requireCurrentUser();

        const profile = await getUserProfile(user);

        setProfileLoading(true);

        // Update form with fetched data
        form.reset({
          name: profile.name,
          email: user.email,
        });

        // Set message tone if it exists in profile
        setMessageTone(profile.message_tone);

        // Set selected emoji if it exists in profile
        setSelectedEmoji(profile.profile_emoji);
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data.",
          variant: "destructive",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, form, toast]);

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
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setEmailUpdating(false);
    }
  };

  const handleMessageToneChange = async (value: string) => {
    const user = await requireCurrentUser();

    setMessageTone(value);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ message_tone: value })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Message tone updated",
        description: `Your messages will now be rephrased with a ${value} tone.`,
      });
    } catch (error) {
      console.error("Error updating message tone:", error);
      toast({
        title: "Update failed",
        description:
          "There was a problem updating your message tone preference.",
        variant: "destructive",
      });
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setSelectedEmoji(emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className="container max-w-3xl py-10 mx-10">
      <h1 className="text-3xl font-bold mb-8">Account</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="flex justify-center py-4">
              Loading profile information...
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                        This is the email used to sign in. Changing your email
                        will require confirmation.
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
                        onClick={() => setShowEmojiPicker((v) => !v)}
                        title="Click to change your emoji"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setShowEmojiPicker((v) => !v);
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
                    <Picker
                      data={emojiData}
                      onEmojiSelect={handleEmojiSelect}
                    />
                  )}
                </div>
                <Button type="submit" disabled={isLoading || emailUpdating}>
                  {isLoading || emailUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Message Preferences</CardTitle>
          <CardDescription>
            Customize how your messages are rephrased
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MessageSquareText className="h-5 w-5" />
                <h3 className="text-lg font-medium">Message Tone</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose how you want your messages to be rephrased when they're
                reviewed.
              </p>
              <Select
                value={messageTone}
                onValueChange={handleMessageToneChange}
              >
                <SelectTrigger className="w-full normal-case">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly" className="normal-case">
                    Friendly
                  </SelectItem>
                  <SelectItem value="professional" className="normal-case">
                    Professional
                  </SelectItem>
                  <SelectItem value="casual" className="normal-case">
                    Casual
                  </SelectItem>
                  <SelectItem value="formal" className="normal-case">
                    Formal
                  </SelectItem>
                  <SelectItem value="encouraging" className="normal-case">
                    Encouraging
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                <p className="italic">
                  {messageTone === "friendly" &&
                    "Messages will be rephrased to sound warm and approachable."}
                  {messageTone === "professional" &&
                    "Messages will be rephrased to sound polished and business-like."}
                  {messageTone === "casual" &&
                    "Messages will be rephrased to sound relaxed and conversational."}
                  {messageTone === "formal" &&
                    "Messages will be rephrased to sound structured and precise."}
                  {messageTone === "encouraging" &&
                    "Messages will be rephrased to sound positive and supportive."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
