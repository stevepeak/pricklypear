import { MessageSquareText, Sparkles, UserCog } from "lucide-react";

export const notifications = [
  {
    key: "newMessages",
    label: "New messages",
    icon: MessageSquareText,
  },
  {
    key: "accountChanges",
    label: "Account changes",
    icon: UserCog,
  },
  // {
  //   key: "dailySummary",
  //   label: "Daily summary",
  //   icon: Zap,
  // },
  // {
  //   key: "weeklySummary",
  //   label: "Weekly summary",
  //   icon: Zap,
  // },
  // {
  //   key: "monthlySummary",
  //   label: "Monthly summary",
  //   icon: Zap,
  // },
  {
    key: "newFeatures",
    label: "New features to Prickly Pear",
    icon: Sparkles,
  },
] as const;

export const notificationChannels = ["browser", "email"] as const;

export type NotificationEventKey = (typeof notifications)[number]["key"];
export type NotificationChannel = (typeof notificationChannels)[number];

export type UserNotification = Record<
  NotificationEventKey,
  Record<NotificationChannel, boolean>
>;

export const userDefaults: UserNotification = {
  newMessages: {
    browser: true,
    email: true,
    // sms: true,
  },
  accountChanges: {
    browser: true,
    email: true,
    // sms: false,
  },
  // dailySummary: {
  //   browser: false,
  //   email: false,
  //   // sms: false,
  // },
  // weeklySummary: {
  //   browser: false,
  //   email: true,
  //   // sms: false,
  // },
  // monthlySummary: {
  //   browser: false,
  //   email: true,
  //   // sms: false,
  // },
  newFeatures: {
    browser: true,
    email: true,
    // sms: true,
  },
};
