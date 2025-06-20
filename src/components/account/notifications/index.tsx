import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Checkbox } from "@/components/ui/checkbox";
import {
  NotificationChannel,
  notificationChannels,
  NotificationEventKey,
  notifications,
  UserNotification,
} from "./types";

interface NotificationPreferencesProps {
  currentUserNotificationSettings: UserNotification;
  onNotificationChange: (
    eventKey: NotificationEventKey,
    channel: NotificationChannel,
    value: boolean,
  ) => void;
}

export function NotificationPreferences({
  currentUserNotificationSettings,
  onNotificationChange,
}: NotificationPreferencesProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Browser</TableHead>
            <TableHead>Email</TableHead>
            {/* <TableHead>SMS</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((event) => (
            <TableRow key={event.key}>
              <TableCell className="font-medium">
                <span className="inline-flex items-center gap-2">
                  <event.icon className="w-4 h-4 text-muted-foreground" />
                  {event.label}
                </span>
              </TableCell>
              {notificationChannels.map((channel) => (
                <TableCell key={channel} className="text-center">
                  <Checkbox
                    checked={
                      currentUserNotificationSettings?.[event.key]?.[channel] ||
                      false
                    }
                    onCheckedChange={(checked) =>
                      onNotificationChange(event.key, channel, !!checked)
                    }
                    className="w-5 h-5 accent-primary"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="text-xs text-muted-foreground mt-2">
        Your preferences are saved locally for now. (Backend integration coming
        soon.)
      </div>
    </>
  );
}
