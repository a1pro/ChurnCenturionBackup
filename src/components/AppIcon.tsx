/* eslint-disable prettier/prettier */
 
import React from 'react';
import { Image,  StyleSheet, NativeModules } from 'react-native';

const { AppIconModule } = NativeModules;

interface DynamicAppIconProps {
  packageName: string;
  size?: number;
  fallbackIcon: any; 
  style?: any;
}

const DynamicAppIcon: React.FC<DynamicAppIconProps> = ({ 
  packageName, 
  size = 40, 
  fallbackIcon,
  style 
}) => {
  const [iconUri, setIconUri] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    fetchIcon();
  }, [packageName]);

  const fetchIcon = async () => {
    console.log('Fetching icon for:', packageName);
    if (!packageName) {
      setError(true);
      return;
    }

    try {
      if (AppIconModule && AppIconModule.getAppIcon) {
        const uri = await AppIconModule.getAppIcon(packageName);
        if (uri && uri.startsWith('data:image')) {
          setIconUri(uri);
        } else {
          setError(true);
        }
      } else {
        // अगर Native Module नहीं मिला
        setError(true);
      }
    } catch (error) {
      console.log('Error fetching dynamic icon for', packageName, error);
      setError(true);
    }
  };

  // अगर icon मिल गया और error नहीं है
  if (iconUri && !error) {
    return (
      <Image
        source={{ uri: iconUri }}
        style={[styles.icon, { width: size, height: size }, style]}
        onError={() => setError(true)} // अगर image load नहीं होती
      />
    );
  }

  // Fallback icon दिखाएँ
  return (
    <Image
      source={fallbackIcon}
      style={[styles.icon, { width: size, height: size }, style]}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    borderRadius: 8,
    resizeMode: 'contain',
  },
});

export default DynamicAppIcon;