import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NotificationPreferences } from "@/components/account/notifications";
import {
  formSchema,
  type FormValues,
} from "@/components/account/personal-info/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getUserProfile, requireCurrentUser } from "@/utils/authCache";
import {
  userDefaults,
  UserNotification,
} from "@/components/account/notifications/types";
import { handleError } from "@/services/messageService/utils";
import { update } from "@/components/account/notifications/update";
import { PersonalInfoForm } from "@/components/account/personal-info";

const Account = () => {
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(true);
  const [notificationPrefs, setNotificationPrefs] =
    useState<UserNotification>(userDefaults);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Fetch user profile data and preferences when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = await requireCurrentUser();
        const profile = await getUserProfile(user);
        setProfileLoading(true);
        setNotificationPrefs(profile.notifications as UserNotification);
        // Update form with fetched data
        form.reset({
          name: profile.name,
          email: user.email,
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        toast("Error loading profile", {
          description: "There was a problem loading your profile data.",
        });
      } finally {
        setProfileLoading(false);
      }
    };
    fetchUserProfile();
  }, [navigate, form]);

  return (
    <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-4 py-10">
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
            currentUserNotificationSettings={notificationPrefs}
            onNotificationChange={async (eventKey, channel, value) => {
              setNotificationPrefs((prev) => ({
                ...prev,
                [eventKey]: {
                  ...prev[eventKey],
                  [channel]: value,
                },
              }));
              try {
                // TODO debounce this
                await update(notificationPrefs);
                toast("Notification preferences updated", {
                  description: "Your notification settings have been saved.",
                });
              } catch (error) {
                handleError(error, "Error updating notification preferences");
                toast("Update failed", {
                  description:
                    "There was a problem saving your notification preferences.",
                });
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
