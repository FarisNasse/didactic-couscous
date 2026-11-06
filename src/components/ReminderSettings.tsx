import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Button, Card, Field, Notice, Pill, Row, Txt, useAction } from "./ui";
const id = "form-daily-journal";
export async function cancelJournalReminder() {
  if (Platform.OS !== "web") {
    const n = await import("expo-notifications");
    await n.cancelScheduledNotificationAsync(id);
  }
}
export default function ReminderSettings() {
  const a = useAction();
  const [hour, setHour] = useState("8"),
    [minute, setMinute] = useState("00"),
    [active, setActive] = useState(false);
  useEffect(() => {
    if (Platform.OS !== "web")
      void import("expo-notifications")
        .then((n) => n.getAllScheduledNotificationsAsync())
        .then((items) =>
          setActive(items.some((item) => item.identifier === id)),
        )
        .catch(() => undefined);
  }, []);
  return (
    <Card>
      <Txt variant="heading">A gentle daily reminder</Txt>
      <Txt>
        A local reminder to open your journal. No health measurements appear on
        your lock screen.
      </Txt>
      <Pill>
        {active ? "Daily reminder scheduled" : "No reminder scheduled"}
      </Pill>
      <Row>
        <Field
          label="Hour (0–23)"
          value={hour}
          onChange={setHour}
          keyboard="number-pad"
        />
        <Field
          label="Minute (0–59)"
          value={minute}
          onChange={setMinute}
          keyboard="number-pad"
        />
      </Row>
      {a.error && <Notice text={a.error} error />}
      <Button
        disabled={a.busy || Platform.OS === "web"}
        onPress={() =>
          a.run(async () => {
            const h = Number(hour),
              m = Number(minute);
            if (
              !hour.trim() ||
              !minute.trim() ||
              !Number.isInteger(h) ||
              !Number.isInteger(m) ||
              h < 0 ||
              h > 23 ||
              m < 0 ||
              m > 59
            )
              throw new Error("Use a valid hour and minute.");
            const n = await import("expo-notifications");
            if (Platform.OS === "android")
              await n.setNotificationChannelAsync("journal", {
                name: "Journal reminders",
                importance: n.AndroidImportance.DEFAULT,
                lockscreenVisibility: n.AndroidNotificationVisibility.PRIVATE,
              });
            const permission = await n.requestPermissionsAsync();
            if (!permission.granted)
              throw new Error("Notification permission was not granted.");
            await n.cancelScheduledNotificationAsync(id);
            await n.scheduleNotificationAsync({
              identifier: id,
              content: {
                title: "A moment for yourself",
                body: "Your FORM journal is here when you are ready.",
                sound: false,
              },
              trigger: {
                type: n.SchedulableTriggerInputTypes.DAILY,
                hour: h,
                minute: m,
                channelId: "journal",
              },
            });
            setActive(true);
          })
        }
      >
        Schedule daily reminder
      </Button>
      <Button
        kind="quiet"
        disabled={!active || a.busy}
        onPress={() =>
          a.run(async () => {
            await cancelJournalReminder();
            setActive(false);
          })
        }
      >
        Remove reminder
      </Button>
      {Platform.OS === "web" && (
        <Txt variant="caption">Local reminders require a native build.</Txt>
      )}
    </Card>
  );
}
