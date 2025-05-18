import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  notificationEvents,
  notificationChannels,
  NotificationPrefsMulti,
  NotificationFrequency,
  frequencyOptions,
} from "./account-types";

interface NotificationPreferencesProps {
  notificationPrefs: NotificationPrefsMulti;
  onNotificationChange: (
    eventKey: keyof NotificationPrefsMulti,
    channel: keyof NotificationPrefsMulti[keyof NotificationPrefsMulti],
    value: NotificationFrequency,
  ) => void;
}

export function NotificationPreferences({
  notificationPrefs,
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
            <TableHead>SMS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notificationEvents.map((event) => (
            <TableRow key={event.key}>
              <TableCell className="font-medium">
                <span className="inline-flex items-center gap-2">
                  <event.icon className="w-4 h-4 text-muted-foreground" />
                  {event.label}
                </span>
              </TableCell>
              {notificationChannels.map((channel) => (
                <TableCell key={channel} className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-36 border rounded-md px-3 py-2 text-sm flex justify-between items-center bg-background"
                      >
                        {notificationPrefs[event.key][channel]
                          .map((v) =>
                            v === "every"
                              ? `Every ${event.label.toLowerCase()}`
                              : frequencyOptions.find((opt) => opt.value === v)
                                  ?.label,
                          )
                          .join(", ") || "Select..."}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="ml-2 h-4 w-4 opacity-50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuCheckboxItem
                        checked={notificationPrefs[event.key][channel].includes(
                          "off",
                        )}
                        onCheckedChange={() =>
                          onNotificationChange(event.key, channel, "off")
                        }
                      >
                        Off
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={notificationPrefs[event.key][channel].includes(
                          "every",
                        )}
                        onCheckedChange={() =>
                          onNotificationChange(event.key, channel, "every")
                        }
                      >
                        Every {event.label.toLowerCase()}
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>AI Summarized</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                          checked={notificationPrefs[event.key][
                            channel
                          ].includes("daily")}
                          onCheckedChange={() =>
                            onNotificationChange(event.key, channel, "daily")
                          }
                        >
                          Daily Summary
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={notificationPrefs[event.key][
                            channel
                          ].includes("weekly")}
                          onCheckedChange={() =>
                            onNotificationChange(event.key, channel, "weekly")
                          }
                        >
                          Weekly Summary
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={notificationPrefs[event.key][
                            channel
                          ].includes("monthly")}
                          onCheckedChange={() =>
                            onNotificationChange(event.key, channel, "monthly")
                          }
                        >
                          Monthly Summary
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

export function handleNotificationChangeMulti(
  eventKey: keyof NotificationPrefsMulti,
  channel: keyof NotificationPrefsMulti[keyof NotificationPrefsMulti],
  value: NotificationFrequency,
  setNotificationPrefs: React.Dispatch<
    React.SetStateAction<NotificationPrefsMulti>
  >,
) {
  setNotificationPrefs((prev) => {
    const current = prev[eventKey][channel];
    let next: NotificationFrequency[];
    if (current.includes(value)) {
      next = current.filter((v) => v !== value);
      // Always have at least one selected; if none, default to 'off'
      if (next.length === 0) next = ["off"];
    } else {
      // If 'off' is selected, remove it when another is checked
      next =
        value === "off"
          ? ["off"]
          : [...current.filter((v) => v !== "off"), value];
    }
    return {
      ...prev,
      [eventKey]: {
        ...prev[eventKey],
        [channel]: next,
      },
    };
  });
}
