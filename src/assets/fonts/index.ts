import { Platform } from "react-native";

const FONTS = {
  black: "SF Pro Display Black",
  bold: "SF Pro Display Bold",
  heavy: "SF Pro Display Heavy",
  light: "SF Pro Display Light",
  medium: "SF Pro Display Medium",
  regular: "SF Pro Display Regular",
  semiBold: "SF Pro Display Semibold",
  thin: "SF Pro Display Thin",
  ultraLight: "SF Pro Display SemiUltralight",
  cursive: "CedarvilleCursive",
};

export type FontFamilyType = keyof typeof FONTS;

/**
 * Function to get the platform-specific font family
 * @param fontKey {FontFamilyType} - The font key from the FONTS object
 * @returns {string} - The platform-specific font family name
 */
export const getPlatformFont = (fontKey: FontFamilyType): string => {
  const iosFonts = {
    black: "SFProDisplay-Black",
    bold: "SFProDisplay-Bold",
    heavy: "SFProDisplay-Heavy",
    light: "SFProDisplay-Light",
    medium: "SFProDisplay-Medium",
    regular: "SFProDisplay-Regular",
    semiBold: "SFProDisplay-Semibold",
    thin: "SFProDisplay-Thin",
    ultraLight: "SFProDisplay-Ultralight",
    cursive: "CedarvilleCursive",
  };

  // Note: On Android, use the exact name as it appears in the font file (sometimes requires PostScript name)
  // On iOS, use the name as it appears in the file (e.g., 'SFProDisplay-Black')
  // On Android, if you use 'SF Pro Display Black' and it doesn't work, try 'SFProDisplay-Black'
  // You may need to adjust FONTS for Android if your fonts are named differently
  return Platform.select({
    ios: iosFonts[fontKey],
    android: FONTS[fontKey],
  }) || FONTS[fontKey];
};
