import React from "react";
import {
  Text as RNText,
  TextInput as RNTextInput,
  type TextProps,
  type TextInputProps,
  StyleSheet,
} from "react-native";

const FONT_FAMILY = "XanhMono";

export const Text = React.forwardRef<RNText, TextProps>((props, ref) => (
  <RNText {...props} ref={ref} style={[styles.defaultFont, props.style]} />
));
Text.displayName = "Text";

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  (props, ref) => (
    <RNTextInput {...props} ref={ref} style={[styles.defaultFont, props.style]} />
  ),
);
TextInput.displayName = "TextInput";

const styles = StyleSheet.create({
  defaultFont: { fontFamily: FONT_FAMILY },
});
