// Types and constants shared by account components
import {
  MessageSquareText,
  ReceiptText,
  UserCog,
  Sparkles,
} from "lucide-react";
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("A valid email is required"),
});

export type FormValues = z.infer<typeof formSchema>;

export const notificationEvents = [
  {
    key: "newMessages",
    label: "New messages",
    icon: MessageSquareText,
  },
  {
    key: "newExpenses",
    label: "New expenses",
    icon: ReceiptText,
  },
  {
    key: "accountChanges",
    label: "Account changes",
    icon: UserCog,
  },
  {
    key: "newFeatures",
    label: "New features to Prickly Pear",
    icon: Sparkles,
  },
] as const;

export const notificationChannels = ["browser", "email", "sms"] as const;

export type NotificationPrefsMulti = {
  [K in (typeof notificationEvents)[number]["key"]]: {
    [C in (typeof notificationChannels)[number]]: NotificationFrequency[];
  };
};

export type NotificationFrequency =
  | "off"
  | "every"
  | "daily"
  | "weekly"
  | "monthly";

export const frequencyOptions: {
  value: NotificationFrequency;
  label: string;
}[] = [
  { value: "off", label: "Off" },
  { value: "every", label: "Every" },
  { value: "daily", label: "Daily Summary" },
  { value: "weekly", label: "Weekly Summary" },
  { value: "monthly", label: "Monthly Summary" },
];
