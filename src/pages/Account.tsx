import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PersonalInfoForm } from "@/components/account/personal-info-form";
import {
  MessagePreferences,
  handleMessageToneChange as handleMessageToneChangeUtil,
} from "@/components/account/message-preferences";
import {
  NotificationPreferences,
  handleNotificationChangeMulti,
} from "@/components/account/notification-preferences";
import {
  formSchema,
  FormValues,
  NotificationPrefsMulti,
  NotificationFrequency,
} from "@/components/account/account-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getUserProfile, requireCurrentUser } from "@/utils/authCache";

const Account = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(true);
  const [_, setMounted] = useState(false);
  const [messageTone, setMessageTone] = useState<string>("friendly");
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPrefsMulti>(() => {
      // Default: all off
      const initial: NotificationPrefsMulti = {
        newMessages: { browser: ["off"], email: ["off"], sms: ["off"] },
        newExpenses: { browser: ["off"], email: ["off"], sms: ["off"] },
        accountChanges: { browser: ["off"], email: ["off"], sms: ["off"] },
        newFeatures: { browser: ["off"], email: ["off"], sms: ["off"] },
      };
      // Optionally, load from localStorage here
      return initial;
    });

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
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data.",
        });
      } finally {
        setProfileLoading(false);
      }
    };
    fetchUserProfile();
  }, [navigate, form, toast]);

  const onMessageToneChange = async (value: string) => {
    await handleMessageToneChangeUtil({ value, setMessageTone, toast });
  };

  return (
    <div className="container max-w-3xl py-10 mx-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <PersonalInfoForm form={form} profileLoading={profileLoading} />
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to be notified for different events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPreferences
            notificationPrefs={notificationPrefs}
            onNotificationChange={(eventKey, channel, value) =>
              handleNotificationChangeMulti(
                eventKey,
                channel,
                value,
                setNotificationPrefs,
              )
            }
          />
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
          <MessagePreferences
            messageTone={messageTone}
            onMessageToneChange={onMessageToneChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
