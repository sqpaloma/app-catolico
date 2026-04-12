import React from "react";
import {
  Text as RNText,
  TextInput as RNTextInput,
  type TextProps,
  type TextInputProps,
  StyleSheet,
  Platform,
} from "react-native";

const FONT_FAMILY = "XanhMono";

function resolveStyle(
  userStyle: TextProps["style"] | TextInputProps["style"],
) {
  const flat = StyleSheet.flatten([styles.defaultFont, userStyle]);
  if (Platform.OS !== "ios") return flat;

  // XanhMono only ships a Regular (400) weight. On iOS, specifying a weight
  // that doesn't exist in the font family causes the entire custom font to
  // fail loading and silently falls back to the system font. Stripping the
  // weight to "normal" guarantees XanhMono always renders.
  const w = flat?.fontWeight;
  if (w && w !== "normal" && w !== "400") {
    return { ...flat, fontWeight: "normal" as const };
  }
  return flat;
}

export const Text = React.forwardRef<RNText, TextProps>((props, ref) => (
  <RNText {...props} ref={ref} style={resolveStyle(props.style)} />
));
Text.displayName = "Text";

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  (props, ref) => (
    <RNTextInput
      {...props}
      ref={ref}
      style={resolveStyle(props.style)}
    />
  ),
);
TextInput.displayName = "TextInput";

const styles = StyleSheet.create({
  defaultFont: { fontFamily: FONT_FAMILY },
});
