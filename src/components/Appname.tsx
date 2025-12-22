import IMAGES from "../assets/images";

 export const POPULAR_STANDALONE_APPS = [
    // Social Media
    'com.whatsapp',
    'com.facebook.katana',
    'com.facebook.system',
    'com.google.android.youtube',
    'com.instagram.android',
    'com.tiktok.musically',
    'com.zhiliaoapp.musically',
    'com.snapchat.android',
    'org.telegram.messenger',
    'com.twitter.android',
    'com.netflix.mediaclient',
    'com.spotify.music',
    
    // Communication
    'com.google.android.gm',
    'com.google.android.apps.messaging',
    'com.skype.raider',
    'com.discord',
    'com.slack',
    
    // Google Apps
    'com.google.android.googlequicksearchbox',
    'com.android.chrome',
    'com.google.android.apps.photos',
    'com.google.android.apps.maps',
    'com.google.android.apps.docs',
    'com.google.android.calendar',
    'com.google.android.keep',
    
    // Shopping & Food
    'com.amazon.mShop.android.shopping',
    'in.amazon.mShop.android.shopping',
    'com.flipkart.android',
    'com.myntra.android',
    'com.swiggy.android',
    'com.application.zomato',
    
    // Travel
    'com.ubercab',
    'com.olacabs.customer',
    
    // System Apps (but popular with icons)
    'com.android.settings',
    'com.android.camera',
    'com.android.dialer',
    'com.android.contacts',
    'com.android.gallery3d',
    'com.google.android.apps.photos',
    'com.miui.calculator.go',
    'com.android.calculator2',
    'com.truecaller',
    'com.android.chrome',
    'com.android.browser',
    
    // Your App
    'com.apptrack',
  ];
  export const SYSTEM_UTILITY_APPS_PATTERNS = [
      // System packages/services
      /^com\.android\.provider\./,
      /^com\.android\.vending/,
      /^com\.google\.android\.gms/,
      /^com\.google\.android\.gsf/,
      /^com\.miui\.securitycenter/,
      /^com\.miui\.cleanmaster/,
      /^com\.miui\.packageinstaller/,
      /^com\.google\.android\.packageinstaller/,
      /^com\.android\.packageinstaller/,
      /^com\.google\.android\.permissioncontroller/,
      /^com\.android\.permissioncontroller/,
      /^com\.miui\.permcenter/,
      
      // System services (generic)
      /system$/i,
      /service$/i,
      /provider$/i,
      /helper$/i,
      /assistant$/i,
      /installer$/i,
      /controller$/i,
      
      // Specific utility apps (no standalone icon)
      /packageinstaller/i,
      /permissioncontroller/i,
      /securitycenter/i,
      /cleanmaster/i,
      /filemanager/i,
      /download/i,
      /wallpaper/i,
      /theme/i,
      /launcher/i,
      /widget/i,
      /inputmethod/i,
      /keyboard/i,
    ];
    export const appNameMap: { [key: string]: string } = {
          // Social Media
          'com.whatsapp': 'WhatsApp',
          'com.facebook.katana': 'Facebook',
          'com.facebook.system': 'Facebook',
          'com.facebook.lite': 'Facebook Lite',
          'com.facebook.orca': 'Messenger',
          'com.google.android.youtube': 'YouTube',
          'com.instagram.android': 'Instagram',
          'com.instagram.lite': 'Instagram Lite',
          'com.tiktok.musically': 'TikTok',
          'com.zhiliaoapp.musically': 'TikTok',
          'com.snapchat.android': 'Snapchat',
          'org.telegram.messenger': 'Telegram',
          'com.twitter.android': 'Twitter',
          'com.twitter.android.lite': 'Twitter Lite',
          'com.pinterest': 'Pinterest',
          'com.reddit.frontpage': 'Reddit',
          
          // Communication
          'com.google.android.apps.messaging': 'Messages',
          'com.android.mms': 'Messages',
          'com.android.dialer': 'Phone',
          'com.android.contacts': 'Contacts',
          'com.android.server.telecom': 'Phone',
          'com.google.android.gm': 'Gmail',
          'com.microsoft.office.outlook': 'Outlook',
          'com.skype.raider': 'Skype',
          'com.discord': 'Discord',
          'com.slack': 'Slack',
          
          // Google Apps
          'com.google.android.googlequicksearchbox': 'Google',
          'com.android.chrome': 'Chrome',
          'com.google.android.apps.photos': 'Photos',
          'com.android.gallery3d': 'Gallery',
          'com.google.android.apps.maps': 'Maps',
          'com.google.android.apps.docs': 'Drive',
          'com.google.android.calendar': 'Calendar',
          'com.google.android.keep': 'Keep',
          'com.google.android.apps.classroom': 'Classroom',
          'com.google.android.apps.meetings': 'Meet',
          
          // System Apps (with icons - show separately)
          'com.android.settings': 'Settings',
          'com.android.camera': 'Camera',
          'com.miui.calculator.go': 'Calculator',
          'com.android.calculator2': 'Calculator',
          'com.truecaller': 'Truecaller',
          'com.android.browser': 'Browser',
          
          // Entertainment
          'com.netflix.mediaclient': 'Netflix',
          'com.amazon.avod.thirdpartyclient': 'Prime Video',
          'com.spotify.music': 'Spotify',
          'com.google.android.youtube.music': 'YouTube Music',
          'com.gaana': 'Gaana',
          'com.jio.media.jiobeats': 'JioSaavn',
          
          // Shopping
          'com.amazon.mShop.android.shopping': 'Amazon',
          'in.amazon.mShop.android.shopping': 'Amazon',
          'com.flipkart.android': 'Flipkart',
          'com.myntra.android': 'Myntra',
          'com.ajio': 'AJIO',
          'com.meesho.supply': 'Meesho',
          
          // Food Delivery
          'com.swiggy.android': 'Swiggy',
          'com.application.zomato': 'Zomato',
          'com.dunzo': 'Dunzo',
          
          // Travel
          'com.ubercab': 'Uber',
          'com.olacabs.customer': 'Ola',
          'in.swiggy.app': 'Swiggy',
          'com.rapido.passenger': 'Rapido',
          
          // Your App
          'com.apptrack': 'AppTrack',
        };
         export const iconMap: { [key: string]: any } = {
      // Social Media
      'com.whatsapp': IMAGES.whattsapp || IMAGES.univercel,
      'com.facebook.katana': IMAGES.facebook || IMAGES.univercel,
      'com.facebook.system': IMAGES.facebook || IMAGES.univercel,
      'com.google.android.youtube': IMAGES.youtube || IMAGES.univercel,
      'com.instagram.android': IMAGES.instagram || IMAGES.univercel,
      'com.tiktok.musically': IMAGES.tiktoke || IMAGES.univercel,
      'com.zhiliaoapp.musically': IMAGES.tiktoke || IMAGES.univercel,
      'com.snapchat.android': IMAGES.snapchat || IMAGES.univercel,
      'org.telegram.messenger': IMAGES.telegram || IMAGES.univercel,
      
      // Communication
      'com.google.android.gm': IMAGES.gmail || IMAGES.univercel,
      'com.google.android.apps.messaging': IMAGES.messages || IMAGES.univercel,
      'com.android.dialer': IMAGES.phone || IMAGES.univercel,
      'com.android.contacts': IMAGES.phone || IMAGES.univercel,
      
      // System Apps (with icons - show separately)
      'com.android.settings': IMAGES.settings || IMAGES.univercel,
      'com.android.camera': IMAGES.camera || IMAGES.univercel,
      'com.miui.calculator.go': IMAGES.calculator || IMAGES.univercel,
      'com.android.calculator2': IMAGES.calculator || IMAGES.univercel,
      'com.truecaller': IMAGES.truecaller || IMAGES.univercel,
      'com.android.chrome': IMAGES.chrome || IMAGES.univercel,
      'com.android.browser': IMAGES.chrome || IMAGES.univercel,
      'com.android.gallery3d': IMAGES.camera || IMAGES.univercel,
      'com.google.android.apps.photos': IMAGES.camera || IMAGES.univercel,
      
      // Your App
      'com.apptrack': IMAGES.logo || IMAGES.univercel,
      
      // Entertainment
      'com.netflix.mediaclient': IMAGES.netflix || IMAGES.univercel,
      'com.spotify.music': IMAGES.spotify || IMAGES.univercel,
    };