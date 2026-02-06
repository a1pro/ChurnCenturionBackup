/* eslint-disable prettier/prettier */
import React from 'react';
import {StyleSheet, Text, type TextProps, TextStyle} from 'react-native';

import COLORS from '../utils/Colors';
import {responsiveFontSize} from '../utils/Metrics';
import {FontFamilyType, getPlatformFont} from '../assets/fonts';

export type CustomTextProps = TextProps & {
  color?: string;
  fontFamily?: FontFamilyType;
  fontWeight?: TextStyle['fontWeight'];
  type?:
    | 'heading'
    | 'subHeading'
    | 'title'
    | 'subTitle'
    | 'default'
    | 'small'
    | 'extraSmall';
};

export function CustomText({
  style,
  fontWeight = 'normal',
  fontFamily = 'regular',
  color = COLORS.appColor,
  type = 'default',
  onPress,
  ...rest
}: CustomTextProps) {

  const calculateLineHeight = (fontSize: number) => Math.ceil(fontSize * 1.1);

  const getTypeStyle = (): TextStyle => {
    const fontSizeMap: Record<string, number> = {
      heading: styles.heading.fontSize,
      subHeading: styles.subHeading.fontSize,
      title: styles.title.fontSize,
      subTitle: styles.subTitle.fontSize,
      default: styles.default.fontSize,
      small: styles.small.fontSize,
      extraSmall: styles.extraSmall.fontSize,
    };

    const fontSize = fontSizeMap[type] || styles.default.fontSize;

    return {
      fontSize,
      lineHeight: calculateLineHeight(fontSize),
    };
  };

  return (
    <Text
      style={[
        {
          color,
          fontFamily: getPlatformFont(fontFamily),
          fontWeight,
        },
        getTypeStyle(),
        style,
      ]}
      onPress={onPress}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: responsiveFontSize(42),
  },
  subHeading: {
    fontSize: responsiveFontSize(24),
  },
  title: {
    fontSize: responsiveFontSize(18),
  },
  subTitle: {
    fontSize: responsiveFontSize(16),
  },
  default: {
    fontSize: responsiveFontSize(14),
  },
  small: {
    fontSize: responsiveFontSize(12),
  },
  extraSmall: {
    fontSize: responsiveFontSize(10),
  },
});
