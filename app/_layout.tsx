import React, { useEffect, useRef, useState } from "react";
import { AppState, Platform, View } from "react-native";
import { Stack as RouterStack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import "../src/integrations/background";
import { getProfile, initialize, useData } from "../src/state/store";
import { syncHealth } from "../src/integrations/health-connect";
import {
  Button,
  Card,
  Loading,
  Notice,
  Stack,
  ThemeProvider,
  Txt,
  useAction,
  useTheme,
} from "../src/components/ui";

function App() {
  const [ready, setReady] = useState(false),
    [error, setError] = useState<string | null>(null),
    [locked, setLocked] = useState(false);
  const d = useData();
  const t = useTheme();
  const a = useAction();
  const authenticating = useRef(false);
  useEffect(() => {
    initialize()
      .then(() => {
        setReady(true);
        setLocked(Platform.OS !== "web" && getProfile().biometricLock);
      })
      .catch(() =>
        setError(
          "Your records could not be opened. Use a native development build with SQLCipher enabled. Your existing data has not been reset.",
        ),
      );
  }, []);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (
        state !== "active" &&
        getProfile().biometricLock &&
        !authenticating.current
      )
        setLocked(true);
      if (state === "active") void syncHealth().catch(() => undefined);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (ready && !locked) void syncHealth().catch(() => undefined);
  }, [ready, locked]);
  if (error)
    return (
      <View
        style={{
          flex: 1,
          padding: 28,
          justifyContent: "center",
          backgroundColor: t.bg,
        }}
      >
        <Notice text={error} error />
        <Button
          onPress={() => {
            setError(null);
            initialize()
              .then(() => setReady(true))
              .catch(() =>
                setError(
                  "Storage is still unavailable. Check the native build instructions.",
                ),
              );
          }}
        >
          Retry
        </Button>
      </View>
    );
  if (!ready) return <Loading />;
  if (locked && d.profiles[0]?.biometricLock)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 24,
          backgroundColor: t.bg,
        }}
      >
        <Card>
          <Txt variant="label">Your private journal</Txt>
          <Txt variant="title">Welcome back.</Txt>
          <Txt>Unlock FORM to view your records.</Txt>
          {a.error && <Notice text={a.error} error />}
          <Button
            disabled={a.busy}
            onPress={() =>
              a.run(async () => {
                authenticating.current = true;
                try {
                  const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: "Unlock FORM",
                    disableDeviceFallback: false,
                  });
                  if (result.success) setLocked(false);
                  else throw new Error("Authentication was cancelled.");
                } finally {
                  authenticating.current = false;
                }
              })
            }
          >
            Unlock
          </Button>
        </Card>
      </View>
    );
  return (
    <>
      <StatusBar style={t.bg === "#131B17" ? "light" : "dark"} />
      <RouterStack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <RouterStack.Screen name="(tabs)" />
        <RouterStack.Screen name="onboarding" />
        <RouterStack.Screen name="log" options={{ presentation: "modal" }} />
        <RouterStack.Screen name="history" />
        <RouterStack.Screen name="settings" />
        <RouterStack.Screen name="privacy" />
      </RouterStack>
    </>
  );
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
export function ErrorBoundary({ retry }: { retry: () => void }) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <View style={{ flex: 1, padding: 28, justifyContent: "center" }}>
          <Stack>
            <Txt variant="heading">FORM could not display this screen.</Txt>
            <Txt>Your saved records remain in local storage.</Txt>
            <Button onPress={retry}>Try again</Button>
          </Stack>
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
