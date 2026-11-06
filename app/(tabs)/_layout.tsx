import React from "react";
import { Redirect, Tabs } from "expo-router";
import { Icon, useTheme } from "../../src/components/ui";
import { useData } from "../../src/state/store";
const tabs = [
  ["index", "Today", "grid-outline"],
  ["nutrition", "Nutrition", "restaurant-outline"],
  ["training", "Training", "barbell-outline"],
  ["physique", "Physique", "body-outline"],
  ["health", "Health", "heart-outline"],
  ["intelligence", "Insights", "sparkles-outline"],
] as const;
export default function TabLayout() {
  const t = useTheme();
  const d = useData();
  if (!d.profiles[0]?.onboarded) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: {
          backgroundColor: t.surface,
          borderTopColor: t.line,
          height: 78,
          paddingTop: 8,
          paddingBottom: 14,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "500" },
      }}
    >
      {tabs.map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => <Icon name={icon} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
