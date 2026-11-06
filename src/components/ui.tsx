import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { useData } from "../state/store";

const light = {
  bg: "#F5F5EF",
  surface: "#FFFFFF",
  text: "#202A25",
  muted: "#64736B",
  line: "#DFE5DC",
  accent: "#43634D",
  sage: "#E4ECDD",
  lavender: "#ECE9F2",
  blue: "#E7EEF2",
  danger: "#9B3D33",
  dangerBg: "#FAEAE6",
};
const dark = {
  bg: "#131B17",
  surface: "#1D2821",
  text: "#E8EEE5",
  muted: "#A1B3A7",
  line: "#33473A",
  accent: "#B5D3AB",
  sage: "#2D4230",
  lavender: "#373341",
  blue: "#293D47",
  danger: "#F2AB9E",
  dangerBg: "#452C27",
};
type Theme = typeof light;
const ThemeContext = createContext<Theme>(light);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { profiles } = useData();
  const system = useColorScheme();
  const mode = profiles[0]?.theme ?? "system";
  return (
    <ThemeContext.Provider
      value={
        mode === "dark" || (mode === "system" && system === "dark")
          ? dark
          : light
      }
    >
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
export function Txt({
  children,
  variant = "body",
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  variant?: "body" | "title" | "heading" | "label" | "caption" | "number";
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const t = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        { color: t.text, fontSize: 15, lineHeight: 23 },
        variant === "title" && {
          fontSize: 36,
          lineHeight: 42,
          fontWeight: "600",
          letterSpacing: -1.1,
        },
        variant === "heading" && {
          fontSize: 20,
          lineHeight: 27,
          fontWeight: "600",
          letterSpacing: -0.3,
        },
        variant === "label" && {
          fontSize: 11,
          lineHeight: 17,
          fontWeight: "700",
          letterSpacing: 1.8,
          textTransform: "uppercase",
          color: t.muted,
        },
        variant === "caption" && {
          fontSize: 12,
          lineHeight: 19,
          color: t.muted,
        },
        variant === "number" && {
          fontSize: 34,
          lineHeight: 42,
          fontWeight: "500",
          letterSpacing: -1,
          fontVariant: ["tabular-nums"],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Icon({
  name,
  size = 20,
  color,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
}) {
  const t = useTheme();
  return <Ionicons name={name} size={size} color={color ?? t.text} />;
}
export function Row({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[{ flexDirection: "row", alignItems: "center", gap: 12 }, style]}
    >
      {children}
    </View>
  );
}
export function Stack({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[{ gap: 16 }, style]}>{children}</View>;
}
export function Card({
  children,
  tone = "normal",
  style,
}: {
  children: React.ReactNode;
  tone?: "normal" | "sage" | "lavender" | "blue";
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: tone === "normal" ? t.surface : t[tone],
          borderRadius: 24,
          padding: 22,
          gap: 16,
          borderWidth: 1,
          borderColor: tone === "normal" ? t.line : "transparent",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Pill({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.sage,
        alignSelf: "flex-start",
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderRadius: 50,
      }}
    >
      <Txt variant="caption" style={{ color: t.accent, fontWeight: "600" }}>
        {children}
      </Txt>
    </View>
  );
}
export function Button({
  children,
  onPress,
  kind = "primary",
  icon,
  disabled = false,
  testID,
}: {
  children: React.ReactNode;
  onPress: () => void | Promise<void>;
  kind?: "primary" | "secondary" | "quiet" | "danger";
  icon?: React.ComponentProps<typeof Icon>["name"];
  disabled?: boolean;
  testID?: string;
}) {
  const t = useTheme();
  const color =
    kind === "primary" ? t.bg : kind === "danger" ? t.danger : t.text;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={typeof children === "string" ? children : undefined}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 46,
        paddingHorizontal: 18,
        paddingVertical: 11,
        borderRadius: 14,
        backgroundColor:
          kind === "primary"
            ? t.accent
            : kind === "secondary"
              ? t.sage
              : kind === "danger"
                ? t.dangerBg
                : "transparent",
        opacity: disabled ? 0.45 : pressed ? 0.72 : 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexShrink: 1,
      })}
    >
      {icon && <Icon name={icon} color={color} size={18} />}
      <Txt style={{ color, fontWeight: "600", fontSize: 14 }}>{children}</Txt>
    </Pressable>
  );
}
export function Screen({
  title,
  eyebrow,
  children,
  back = false,
  action,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  back?: boolean;
  action?: React.ReactNode;
}) {
  const t = useTheme();
  const d = useData();
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: t.bg }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 22,
          paddingBottom: 45,
          maxWidth: 960,
          width: "100%",
          alignSelf: "center",
          gap: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Row style={{ justifyContent: "space-between" }}>
          <Row>
            {back && (
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                onPress={() => router.back()}
                style={{ padding: 10 }}
              >
                <Icon name="arrow-back" />
              </Pressable>
            )}
            <Txt
              variant="label"
              style={{ letterSpacing: 5, fontSize: 14, color: t.text }}
            >
              FORM
            </Txt>
          </Row>
          {action ?? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              onPress={() => router.push("/settings")}
              style={{
                width: 43,
                height: 43,
                backgroundColor: t.sage,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Txt style={{ fontWeight: "600" }}>
                {d.profiles[0]?.name.slice(0, 1).toUpperCase() || "F"}
              </Txt>
            </Pressable>
          )}
        </Row>
        <Stack style={{ gap: 7 }}>
          {eyebrow && <Txt variant="label">{eyebrow}</Txt>}
          <Txt variant="title">{title}</Txt>
        </Stack>
        {d.profiles[0]?.demo && (
          <Notice text="Sample data is on. These records are fictional. Remove it in Settings before tracking your own progress." />
        )}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Stack style={{ gap: 13 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Txt variant="heading">{title}</Txt>
        {aside}
      </Row>
      {children}
    </Stack>
  );
}
export function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard = "default",
  multiline = false,
  secure = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  keyboard?: "default" | "decimal-pad" | "number-pad";
  multiline?: boolean;
  secure?: boolean;
}) {
  const t = useTheme();
  const [text, setText] = useState(value),
    [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(value);
  }, [value, focused]);
  return (
    <Stack style={{ gap: 6 }}>
      <Txt variant="caption" style={{ fontWeight: "600" }}>
        {label}
      </Txt>
      <TextInput
        accessibilityLabel={label}
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={(v) => {
          setText(v);
          onChange(v);
        }}
        placeholder={placeholder}
        placeholderTextColor={t.muted}
        keyboardType={keyboard}
        multiline={multiline}
        secureTextEntry={secure}
        autoCapitalize="none"
        style={{
          minHeight: 48,
          padding: 13,
          color: t.text,
          backgroundColor: t.bg,
          borderColor: t.line,
          borderWidth: 1,
          borderRadius: 12,
          fontSize: 16,
          ...(multiline
            ? { minHeight: 84, textAlignVertical: "top" as const }
            : {}),
        }}
      />
    </Stack>
  );
}
export function Choices<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  const t = useTheme();
  return (
    <Stack style={{ gap: 8 }}>
      {label && <Txt variant="caption">{label}</Txt>}
      <Row style={{ flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === option }}
            onPress={() => onChange(option)}
            style={{
              paddingHorizontal: 13,
              paddingVertical: 10,
              minHeight: 43,
              borderRadius: 12,
              backgroundColor: value === option ? t.accent : t.bg,
              borderWidth: 1,
              borderColor: value === option ? t.accent : t.line,
            }}
          >
            <Txt
              style={{
                fontSize: 13,
                color: value === option ? t.bg : t.text,
                fontWeight: value === option ? "600" : "400",
              }}
            >
              {option}
            </Txt>
          </Pressable>
        ))}
      </Row>
    </Stack>
  );
}
export function Toggle({
  label,
  value,
  onChange,
  detail,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  detail?: string;
}) {
  const t = useTheme();
  return (
    <Row style={{ justifyContent: "space-between" }}>
      <Stack style={{ gap: 2, flex: 1 }}>
        <Txt>{label}</Txt>
        {detail && <Txt variant="caption">{detail}</Txt>}
      </Stack>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: t.line, true: "#70916B" }}
      />
    </Row>
  );
}
export function Notice({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      accessibilityRole={error ? "alert" : "text"}
      style={{
        backgroundColor: error ? t.dangerBg : t.sage,
        padding: 15,
        borderRadius: 14,
      }}
    >
      <Txt style={{ fontSize: 13, color: error ? t.danger : t.text }}>
        {text}
      </Txt>
    </View>
  );
}
export function Empty({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <Icon name="leaf-outline" size={27} />
      <Txt variant="heading">{title}</Txt>
      <Txt style={{ maxWidth: 560 }}>{detail}</Txt>
      {action}
    </Card>
  );
}
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(0);
  const run = async (fn: () => Promise<void>) => {
    active.current++;
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "This action could not be completed. Please try again.",
      );
    } finally {
      active.current--;
      setBusy(active.current > 0);
    }
  };
  return { busy, error, run, setError };
}
export function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#0008",
          justifyContent: "center",
          padding: 18,
        }}
      >
        <SafeAreaView
          style={{
            backgroundColor: t.surface,
            borderRadius: 25,
            maxWidth: 640,
            width: "100%",
            alignSelf: "center",
            maxHeight: "95%",
          }}
        >
          <Row style={{ padding: 20, justifyContent: "space-between" }}>
            <Txt variant="heading" style={{ flex: 1 }}>
              {title}
            </Txt>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
              onPress={onClose}
              style={{ padding: 9 }}
            >
              <Icon name="close" />
            </Pressable>
          </Row>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 22, paddingTop: 0, gap: 18 }}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
export function ConfirmButton({
  label,
  detail,
  onConfirm,
}: {
  label: string;
  detail: string;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const a = useAction();
  return (
    <>
      <Button kind="danger" onPress={() => setOpen(true)}>
        {label}
      </Button>
      <Sheet title={label} visible={open} onClose={() => setOpen(false)}>
        <Txt>{detail}</Txt>
        {a.error && <Notice text={a.error} error />}
        <Button
          kind="danger"
          disabled={a.busy}
          onPress={() =>
            a.run(async () => {
              await onConfirm();
              setOpen(false);
            })
          }
        >
          {a.busy ? "Working…" : "Confirm"}
        </Button>
        <Button kind="quiet" onPress={() => setOpen(false)}>
          Cancel
        </Button>
      </Sheet>
    </>
  );
}
export function Progress({
  value,
  target,
  color,
}: {
  value: number | null;
  target?: number;
  color?: string;
}) {
  const t = useTheme();
  const ratio =
    value !== null && target ? Math.min(1, Math.max(0, value / target)) : 0;
  return (
    <View
      style={{
        height: 6,
        borderRadius: 6,
        backgroundColor: t.line,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: 6,
          width: `${ratio * 100}%`,
          backgroundColor: color ?? t.accent,
          borderRadius: 6,
        }}
      />
    </View>
  );
}
export function Stat({
  label,
  value,
  unit,
  detail,
  onPress,
}: {
  label: string;
  value: string;
  unit?: string;
  detail?: string;
  onPress?: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={`${label}: ${value} ${unit ?? ""}. ${detail ?? ""}`}
      onPress={onPress}
      disabled={!onPress}
      style={{
        flex: 1,
        minWidth: 140,
        padding: 19,
        borderRadius: 21,
        borderColor: t.line,
        borderWidth: 1,
        backgroundColor: t.surface,
        gap: 6,
      }}
    >
      <Txt variant="caption">{label}</Txt>
      <Row style={{ alignItems: "baseline", gap: 5 }}>
        <Txt variant="number">{value}</Txt>
        <Txt variant="caption">{unit}</Txt>
      </Row>
      {detail && <Txt variant="caption">{detail}</Txt>}
    </Pressable>
  );
}
export function Chart({
  points,
  label,
  color,
}: {
  points: Array<{ date: string; value: number }>;
  label: string;
  color?: string;
}) {
  const t = useTheme();
  if (!points.length)
    return <Txt variant="caption">No recorded history yet.</Txt>;
  const low = Math.min(...points.map((p) => p.value)),
    high = Math.max(...points.map((p) => p.value));
  const range = high - low || 1;
  const loTime = Date.parse(points[0]!.date),
    hiTime = Date.parse(points[points.length - 1]!.date);
  const span = hiTime - loTime || 1;
  const xy = points.map((p) => ({
    x: 8 + ((Date.parse(p.date) - loTime) / span) * 384,
    y: 88 - ((p.value - low) / range) * 70,
  }));
  const path = xy.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  return (
    <Stack style={{ gap: 5 }}>
      <View
        accessible
        accessibilityLabel={`${label}. ${points.length} recorded days. Range ${low.toFixed(1)} to ${high.toFixed(1)}. Missing dates are not filled.`}
      >
        <Svg width="100%" height={105} viewBox="0 0 400 105">
          <Line x1="0" x2="400" y1="94" y2="94" stroke={t.line} />
          <Path
            d={`${path} L${xy[xy.length - 1]!.x},94 L${xy[0]!.x},94 Z`}
            fill={color ?? t.accent}
            opacity={0.07}
          />
          <Path
            d={path}
            fill="none"
            stroke={color ?? t.accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {xy.length === 1 && (
            <Circle
              cx={xy[0]!.x}
              cy={xy[0]!.y}
              r="4"
              fill={color ?? t.accent}
            />
          )}
        </Svg>
      </View>
      <Row style={{ justifyContent: "space-between" }}>
        <Txt variant="caption">{points[0]!.date.slice(5)}</Txt>
        <Txt variant="caption">
          Scaled range {low.toFixed(1)}–{high.toFixed(1)}
        </Txt>
        <Txt variant="caption">{points[points.length - 1]!.date.slice(5)}</Txt>
      </Row>
    </Stack>
  );
}
export function Loading() {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.bg,
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <Txt variant="label" style={{ letterSpacing: 8 }}>
        FORM
      </Txt>
      <ActivityIndicator color={t.accent} />
    </View>
  );
}
