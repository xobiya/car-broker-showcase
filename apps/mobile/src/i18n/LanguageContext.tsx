import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type Locale = 'en' | 'am' | 'om';

export interface LocaleMeta {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  shortLabel: string;
}

export const localeMetadata: Record<Locale, LocaleMeta> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    shortLabel: 'EN',
  },
  am: {
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    flag: '🇪🇹',
    shortLabel: 'አማ',
  },
  om: {
    code: 'om',
    name: 'Afaan Oromo',
    nativeName: 'Afaan Oromoo',
    flag: '🇪🇹',
    shortLabel: 'ORO',
  },
};

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.saved': 'Saved',
    'nav.compare': 'Compare',
    'nav.ranks': 'Ranks',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.account': 'Account',
    'nav.contact': 'Contact Us',

    // Common actions
    'action.search': 'Search',
    'action.reset': 'Reset',
    'action.filter': 'Filters',
    'action.signIn': 'Sign In',
    'action.signUp': 'Create Account / Sign Up',
    'action.signOut': 'Sign Out',
    'action.editProfile': 'Edit Profile',
    'action.postVehicle': '+ Post Vehicle for Sale',
    'action.call': 'Call',
    'action.callBroker': 'Call Broker',
    'action.viewDetails': 'View Details',
    'action.dismiss': 'Dismiss',
    'action.submit': 'Submit Inquiry',
    'action.apply': 'Search',

    // Home Screen
    'home.eyebrow': 'VERIFIED MARKETPLACE',
    'home.greeting': 'Hello',
    'home.guestGreeting': 'Hello Guest',
    'home.welcomeBack': 'Welcome back',
    'home.tapToAuth': 'Tap to Sign In / Sign Up',
    'home.headlinePre': 'Shop ',
    'home.headlineAccent': 'Vehicles',
    'home.headlinePost': ' in the easiest way all the time.',
    'home.searchPlaceholder': 'Search for cars, models, Bole...',
    'home.newCollection': 'NEW COLLECTION',
    'home.exclusiveDeals': 'Exclusive Car Deals',
    'home.verifiedDiscount': 'Verified inspections & up to 50% discount on broker fees.',
    'home.exploreNow': 'Explore now',
    'home.zeroRisk': 'Zero Title Risk',
    'home.zeroRiskSub': 'Every car verified with Road Authority & clean original Libre.',
    'home.featured': 'Featured Vehicles',
    'home.recentlyAdded': 'Recently Added',
    'home.viewAll': 'View all',
    'home.allCars': 'All Cars',
    'home.suvs': 'SUVs',
    'home.sedans': 'Sedans',
    'home.electric': 'Electric',
    'home.luxury': 'Luxury',

    // Search Screen
    'search.eyebrow': 'FIND YOUR MATCH',
    'search.title': 'Search cars',
    'search.placeholder': 'Search make, model, Bole, Addis...',
    'search.sortBy': 'SORT BY',
    'search.newest': 'Newest',
    'search.priceLow': 'Price: Low',
    'search.priceHigh': 'Price: High',
    'search.lowestKm': 'Lowest Km',
    'search.brand': 'Brand / Make',
    'search.condition': 'Condition',
    'search.fuel': 'Fuel Type',
    'search.priceRange': 'Price Range (ETB)',
    'search.location': 'Location / Sub-city',
    'search.prev': 'Prev',
    'search.next': 'Next',
    'search.noCars': 'No vehicles found',
    'search.noCarsSub': 'Try adjusting your search criteria or resetting filters.',

    // Card & Specs
    'card.call': 'Call',
    'card.verified': 'Verified',
    'card.new': 'NEW',
    'card.used': 'USED',
    'card.auto': 'Auto',
    'card.manual': 'Manual',
    'card.petrol': 'Petrol',
    'card.diesel': 'Diesel',
    'card.ev': 'Electric',
    'card.hybrid': 'Hybrid',

    // Profile & Settings
    'profile.title': 'Profile & Settings',
    'profile.guestTitle': 'Welcome to Arif Auto',
    'profile.guestSubtitle': 'Sign in or create an account with your name to sell vehicles, track inquiries, and save your favorite cars.',
    'profile.sellingHub': 'Vehicle Selling & Garage',
    'profile.sellHeroTitle': 'Sell Your Vehicle on Arif Auto',
    'profile.sellHeroSubtitle': 'List your car with certified Libre documents and connect directly with thousands of buyers in Ethiopia.',
    'profile.addNewListing': 'Add New Vehicle Listing',
    'profile.myGarage': 'My Garage & Active Listings',
    'profile.inquiries': 'Buyer Inquiries & Leads',
    'profile.testDrives': 'Test Drive Bookings',
    'profile.libreGuide': 'Ethiopian Seller & Libre Guide',
    'profile.accountActivity': 'Account & Activity',
    'profile.savedVehicles': 'Saved & Favorite Vehicles',
    'profile.compareVehicles': 'Compare Vehicles',
    'profile.orderHistory': 'Order & Inspection History',
    'profile.onboardingShowcase': 'Onboarding Showcase',
    'profile.generalSettings': 'General Settings',
    'profile.personalDetails': 'Personal Details',
    'profile.theme': 'Theme Mode',
    'profile.language': 'Language',
    'profile.notifications': 'Notifications',
    'profile.savedAddresses': 'Saved Addresses',
    'profile.contactUs': 'Contact Us & Showroom',
    'profile.terms': 'Terms of Use & Buyer Protection',
    'profile.prefTitle': 'Preferences & Appearance',

    // Themes
    'theme.system': 'System Default',
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',

    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Reach our Addis Ababa headquarters, schedule certified inspections, or submit an inquiry.',
    'contact.phone': '+251 91 123 4567',
    'contact.email': 'support@arifauto.et',
    'contact.address': 'Bole Medhanialem, Edna Mall Commercial Center, 3rd Floor, Addis Ababa, Ethiopia',
    'contact.hours': 'Mon – Sat: 8:30 AM – 6:30 PM | Sun: 9:00 AM – 1:00 PM',
    'contact.topic': 'Select Inquiry Topic',
    'contact.namePlaceholder': 'Your Full Name *',
    'contact.phonePlaceholder': 'Phone Number (+251...) *',
    'contact.emailPlaceholder': 'Email Address (optional)',
    'contact.vehicleRefPlaceholder': 'Vehicle Model / ID (e.g. Toyota RAV4)',
    'contact.messagePlaceholder': 'Describe your request, viewing date, or question...',
    'contact.success': 'Your inquiry has been submitted! Our Addis Ababa concierge team will contact you within 2 business hours.',
  },

  am: {
    // Navigation
    'nav.home': 'ዋና ገጽ',
    'nav.explore': 'መኪናዎችን ፈልግ',
    'nav.saved': 'የተቀመጡ',
    'nav.compare': 'አወዳድር',
    'nav.ranks': 'ደረጃዎች',
    'nav.profile': 'መገለጫ',
    'nav.settings': 'ማስተካከያ',
    'nav.account': 'መለያ',
    'nav.contact': 'አግኙን',

    // Common actions
    'action.search': 'ፈልግ',
    'action.reset': 'ዳግም አስጀምር',
    'action.filter': 'አጣራ',
    'action.signIn': 'ግባ',
    'action.signUp': 'አዲስ መለያ ፍጠር / ስምህን አስገባ',
    'action.signOut': 'ውጣ',
    'action.editProfile': 'መለያ አርትዕ',
    'action.postVehicle': '+ መኪና ለመሸጥ መዝግብ',
    'action.call': 'ደውል',
    'action.callBroker': 'ደላላ ይደውሉ',
    'action.viewDetails': 'ሙሉ መረጃ ተመልከት',
    'action.dismiss': 'ዝጋ',
    'action.submit': 'መልእክት ላክ',
    'action.apply': 'ፈልግ',

    // Home Screen
    'home.eyebrow': 'የተረጋገጠ የገበያ ቦታ',
    'home.greeting': 'ሰላም',
    'home.guestGreeting': 'ሰላም እንግዳ',
    'home.welcomeBack': 'እንኳን ደህና መጡ',
    'home.tapToAuth': 'ለመግባት ወይም ለመመዝገብ ይጫኑ',
    'home.headlinePre': 'ምርጥ ',
    'home.headlineAccent': 'መኪናዎችን',
    'home.headlinePost': ' በቀላሉ እና በፍጥነት ይግዙ ወይም ይሽጡ።',
    'home.searchPlaceholder': 'መኪና፣ ሞዴል፣ ቦሌ ፈልግ...',
    'home.newCollection': 'አዲስ ስብስብ',
    'home.exclusiveDeals': 'ልዩ የመኪና ቅናሾች',
    'home.verifiedDiscount': 'የተረጋገጠ ፍተሻ እና እስከ 50% የደላላ ክፍያ ቅናሽ።',
    'home.exploreNow': 'አሁን ይመልከቱ',
    'home.zeroRisk': 'ከስጋት ነጻ የባለቤትነት ሰነድ',
    'home.zeroRiskSub': 'እያንዳንዱ መኪና በመንገድ ትራንስፖርት እና በዋና ሊብሬ የተረጋገጠ።',
    'home.featured': 'ተለይተው የቀረቡ መኪኖች',
    'home.recentlyAdded': 'በቅርብ የተጨመሩ',
    'home.viewAll': 'ሁሉንም ይመልከቱ',
    'home.allCars': 'ሁሉም መኪኖች',
    'home.suvs': 'ኤስ.ዩ.ቪ',
    'home.sedans': 'ሴዳን',
    'home.electric': 'ኤሌክትሪክ',
    'home.luxury': 'ቅንጦት',

    // Search Screen
    'search.eyebrow': 'የሚፈልጉትን ያግኙ',
    'search.title': 'መኪናዎችን ፈልግ',
    'search.placeholder': 'ሞዴል፣ አድራሻ፣ ቦሌ...',
    'search.sortBy': 'ቅደም ተከተል',
    'search.newest': 'አዳዲስ',
    'search.priceLow': 'ዋጋ፡ ዝቅተኛ',
    'search.priceHigh': 'ዋጋ፡ ከፍተኛ',
    'search.lowestKm': 'አነስተኛ ኪ.ሜ',
    'search.brand': 'የመኪናው አይነት (Brand)',
    'search.condition': 'ሁኔታ',
    'search.fuel': 'የነዳጅ አይነት',
    'search.priceRange': 'የዋጋ መጠን (ብር)',
    'search.location': 'አካባቢ / ክፍለ ከተማ',
    'search.prev': 'ቀዳሚ',
    'search.next': 'ቀጣይ',
    'search.noCars': 'ምንም መኪና አልተገኘም',
    'search.noCarsSub': 'የፍለጋ መስፈርቶቹን ቀይረው ይሞክሩ።',

    // Card & Specs
    'card.call': 'ደውል',
    'card.verified': 'የተረጋገጠ',
    'card.new': 'አዲስ',
    'card.used': 'ያገለገለ',
    'card.auto': 'ኦቶማቲክ',
    'card.manual': 'ማንዋል',
    'card.petrol': 'ቤንዚን',
    'card.diesel': 'ናፍጣ',
    'card.ev': 'ኤሌክትሪክ',
    'card.hybrid': 'ሀይብሪድ',

    // Profile & Settings
    'profile.title': 'መለያ እና ማስተካከያዎች',
    'profile.guestTitle': 'እንኳን ወደ አሪፍ አውቶ በደህና መጡ',
    'profile.guestSubtitle': 'መኪና ለመሸጥ፣ ለመግዛት እና ከታወቁ ደላሎች ጋር ለመገናኘት እባክዎ ይግቡ ወይም በስምዎ ይመዝገቡ።',
    'profile.sellingHub': 'የመኪና ሽያጭ እና ጋራዥ',
    'profile.sellHeroTitle': 'መኪናዎን በአሪፍ አውቶ ላይ ይሽጡ',
    'profile.sellHeroSubtitle': 'ትክክለኛ ሊብሬ ሰነድ በማስያዝ በቀጥታ ለሺዎች ገዢዎች ያቅርቡ።',
    'profile.addNewListing': 'አዲስ የመኪና ሽያጭ መዝግብ',
    'profile.myGarage': 'የኔ ጋራዥ እና የተመዘገቡ መኪኖች',
    'profile.inquiries': 'የገዢዎች መልእክቶች',
    'profile.testDrives': 'የሙከራ ማሽከርከር ቀጠሮዎች',
    'profile.libreGuide': 'የሊብሬ እና የባለቤትነት መመሪያ',
    'profile.accountActivity': 'የመለያ እንቅስቃሴዎች',
    'profile.savedVehicles': 'የተቀመጡ ተወዳጅ መኪኖች',
    'profile.compareVehicles': 'መኪኖችን አወዳድር',
    'profile.orderHistory': 'የትዕዛዝ እና የፍተሻ ታሪክ',
    'profile.onboardingShowcase': 'የመተግበሪያ ማስተዋወቂያ',
    'profile.generalSettings': 'አጠቃላይ ማስተካከያዎች',
    'profile.personalDetails': 'የግል መረጃ',
    'profile.theme': 'ገጽታ (ቀለም/ሁኔታ)',
    'profile.language': 'ቋንቋ',
    'profile.notifications': 'ማሳወቂያዎች',
    'profile.savedAddresses': 'የተቀመጠ አድራሻ',
    'profile.contactUs': 'አግኙን እና የቢሮ አድራሻ',
    'profile.terms': 'የአገልግሎት ውሎች እና የገዢ ዋስትና',
    'profile.prefTitle': 'የገጽታ እና የቋንቋ ምርጫዎች',

    // Themes
    'theme.system': 'የስልክ ነባሪ',
    'theme.light': 'ብሩህ (Light)',
    'theme.dark': 'ጨለማ (Dark)',

    // Contact
    'contact.title': 'አግኙን',
    'contact.subtitle': 'አዲስ አበባ ቦሌ የሚገኘውን ዋና ቢሮአችንን ያግኙ ወይም ጥያቄዎን ይላኩልን።',
    'contact.phone': '+251 91 123 4567',
    'contact.email': 'support@arifauto.et',
    'contact.address': 'ቦሌ መድኃኔዓለም፣ ኤድና ሞል ኮሜርሻል ህንጻ፣ 3ኛ ፎቅ፣ አዲስ አበባ፣ ኢትዮጵያ',
    'contact.hours': 'ሰኞ – ቅዳሜ: 2:30 – 12:30 | እሁድ: 3:00 – 7:00',
    'contact.topic': 'የጥያቄው አይነት ይምረጡ',
    'contact.namePlaceholder': 'ሙሉ ስምዎ *',
    'contact.phonePlaceholder': 'ስልክ ቁጥር (+251...) *',
    'contact.emailPlaceholder': 'ኢሜይል አድራሻ (አስገዳጅ ያልሆነ)',
    'contact.vehicleRefPlaceholder': 'የመኪናው ሞዴል ወይም መለያ (ምሳሌ፡ ቶዮታ ራቭ4)',
    'contact.messagePlaceholder': 'ጥያቄዎን ወይም የጉብኝት ቀጠሮዎን እዚህ ይጻፉ...',
    'contact.success': 'መልእክትዎ ደርሶናል! የደንበኞች አገልግሎት ቡድናችን በ2 የስራ ሰዓት ውስጥ ይደውልልዎታል።',
  },

  om: {
    // Navigation
    'nav.home': 'Fuula Duraa',
    'nav.explore': 'Konkolaataa Barbaadi',
    'nav.saved': 'Kan Olkaawwame',
    'nav.compare': 'Walbira Qabi',
    'nav.ranks': 'Sadarkaa',
    'nav.profile': 'Piroofayilii',
    'nav.settings': 'Qindaa’ina',
    'nav.account': 'Eenyummee',
    'nav.contact': 'Nu Qunnamaa',

    // Common actions
    'action.search': 'Barbaadi',
    'action.reset': 'Irra Deebi’i',
    'action.filter': 'Filtarii',
    'action.signIn': 'Seeni',
    'action.signUp': 'Herrega Haaraa Banadhu / Maqaa Galchi',
    'action.signOut': 'Bahi',
    'action.editProfile': 'Gulaali',
    'action.postVehicle': '+ Konkolaataa Gurguraaf Galmeessi',
    'action.call': 'Bilbili',
    'action.callBroker': 'Dallalaaf Bilbili',
    'action.viewDetails': 'Bal’ina Ilaali',
    'action.dismiss': 'Cufi',
    'action.submit': 'Ergi',
    'action.apply': 'Barbaadi',

    // Home Screen
    'home.eyebrow': 'GABAABAA MIRKANAA’AA',
    'home.greeting': 'Akkam',
    'home.guestGreeting': 'Akkam Keessummaa',
    'home.welcomeBack': 'Baga Nagaan Deebitan',
    'home.tapToAuth': 'Seenuuf Yookiin Galmaa’uuf Tuqi',
    'home.headlinePre': 'Konkolaattota ',
    'home.headlineAccent': 'Gaarii',
    'home.headlinePost': ' salphaatti fi saffisaan biti yookiin gurguri.',
    'home.searchPlaceholder': 'Konkolaataa, moodeela, Boolee...',
    'home.newCollection': 'WALITTI-QABAMA HAARAA',
    'home.exclusiveDeals': 'Gatii Gad-Aanaa Addaa',
    'home.verifiedDiscount': 'Qorannoo mirkanaa’aa fi kaffaltii dallalaa hanga 50% hir’ate.',
    'home.exploreNow': 'Amma Ilaali',
    'home.zeroRisk': 'Sodaa Abbummaa Tokko Malee',
    'home.zeroRiskSub': 'Konkolaataan hundi abbaa taayitaa geejjibaa fi liibiree qulqulluun kan mirkanaa’e.',
    'home.featured': 'Konkolaattota Filataman',
    'home.recentlyAdded': 'Dhiyeenya Kan Dabalame',
    'home.viewAll': 'Hunda Ilaali',
    'home.allCars': 'Konkolaataa Hunda',
    'home.suvs': 'SUV',
    'home.sedans': 'Sedan',
    'home.electric': 'Elektiriikii',
    'home.luxury': 'Qananii (Luxury)',

    // Search Screen
    'search.eyebrow': 'KAN SI BARBAACHISU BARBAADI',
    'search.title': 'Konkolaataa Barbaadi',
    'search.placeholder': 'Moodeela, iddoo, Boolee...',
    'search.sortBy': 'TARTIIBA',
    'search.newest': 'Haaraa',
    'search.priceLow': 'Gatii: Xiqqaa',
    'search.priceHigh': 'Gatii: Guddaa',
    'search.lowestKm': 'Km Xiqqaa',
    'search.brand': 'Gosa Konkolaataa',
    'search.condition': 'Haala',
    'search.fuel': 'Gosa Boba’aa',
    'search.priceRange': 'Hamma Gatii (Birr)',
    'search.location': 'Iddoo / Kiflee Katamaa',
    'search.prev': 'Duraa',
    'search.next': 'Itti Aanu',
    'search.noCars': 'Konkolaataan tokkollee hin argamne',
    'search.noCarsSub': 'Ulaagaalee barbaacha keessanii jijjiiraa yaalaa.',

    // Card & Specs
    'card.call': 'Bilbili',
    'card.verified': 'Mirkanaa’e',
    'card.new': 'HAARAA',
    'card.used': 'HOJII IRRA KAN OOLE',
    'card.auto': 'Ootoomaatiikii',
    'card.manual': 'Maanuwaalii',
    'card.petrol': 'Beenzila',
    'card.diesel': 'Naafxaa',
    'card.ev': 'Elektiriikii',
    'card.hybrid': 'Haayibiriidii',

    // Profile & Settings
    'profile.title': 'Eenyummee fi Qindaa’ina',
    'profile.guestTitle': 'Baga Arif Auto Dhuftan',
    'profile.guestSubtitle': 'Konkolaataa gurguruuf, bituuf, fi dallaloota mirkanaa’an waliin qunnamuuf seeni yookiin maqaa keetiin galmaa’i.',
    'profile.sellingHub': 'Gurgurtaa Konkolaataa & Gaaraajii',
    'profile.sellHeroTitle': 'Konkolaataa Keessan Arif Auto Irraatti Gurguraa',
    'profile.sellHeroSubtitle': 'Sanada liibiree mirkanaa’een kallattiin bittoota kumaatamaaf dhiyeessaa.',
    'profile.addNewListing': 'Konkolaataa Haaraa Galmeessi',
    'profile.myGarage': 'Gaaraajii Koo & Konkolaattota Galmaa’an',
    'profile.inquiries': 'Ergaawwan Bittootaa',
    'profile.testDrives': 'Beellama Yaalii Konkolaachisuu',
    'profile.libreGuide': 'Qajeelfama Liibiree fi Abbummaa',
    'profile.accountActivity': 'Sochii Herregaa',
    'profile.savedVehicles': 'Konkolaattota Jaallataman',
    'profile.compareVehicles': 'Konkolaattota Walbira Qabi',
    'profile.orderHistory': 'Seenaa Ajajaa fi Qorannoo',
    'profile.onboardingShowcase': 'Beeksisa Appilikeeshinii',
    'profile.generalSettings': 'Qindaa’ina Waliigalaa',
    'profile.personalDetails': 'Oodeeffannoo Dhuunfaa',
    'profile.theme': 'Haala Halluu (Theme)',
    'profile.language': 'Afaan',
    'profile.notifications': 'Beeksisa',
    'profile.savedAddresses': 'Teessoo Olkaawwame',
    'profile.contactUs': 'Nu Qunnamaa & Teessoo Waajjiraa',
    'profile.terms': 'Waliigaltee Tajaajilaa fi Wabii Bittaa',
    'profile.prefTitle': 'Filannoowwan Halluu fi Afaanii',

    // Themes
    'theme.system': 'Haala Bilbilaa',
    'theme.light': 'Ifaa (Light)',
    'theme.dark': 'Dukkana (Dark)',

    // Contact
    'contact.title': 'Nu Qunnamaa',
    'contact.subtitle': 'Waajjira Finfinnee keenya qunnamaa yookiin gaaffii keessan nuuf ergaa.',
    'contact.phone': '+251 91 123 4567',
    'contact.email': 'support@arifauto.et',
    'contact.address': 'Boolee Madahaaniyaalam, Gamoo Edna Mall, Fooxaa 3ffaa, Finfinnee, Itoophiyaa',
    'contact.hours': 'Wiixata – Sanbata: 2:30 – 12:30 | Dilbata: 3:00 – 7:00',
    'contact.topic': 'Gosa Gaaffii Filadhaa',
    'contact.namePlaceholder': 'Maqaa Guutuu *',
    'contact.phonePlaceholder': 'Lakkoofsa Bilbilaa (+251...) *',
    'contact.emailPlaceholder': 'Imeelii (dirqama miti)',
    'contact.vehicleRefPlaceholder': 'Gosa Konkolaataa (fkn. Toyota RAV4)',
    'contact.messagePlaceholder': 'Ergaa yookiin gaaffii keessan asitti barreessaa...',
    'contact.success': 'Ergaan keessan nu gaheera! Gareen tajaajila maamiltootaa sa’aatii 2 keessatti isiniif bilbila.',
  },
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (loc: Locale) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  locales: readonly Locale[];
  localeMetadata: Record<Locale, LocaleMeta>;
}

const LANGUAGE_STORAGE_KEY = 'arif_language_locale';
let memoryLocale: Locale = 'en';

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: async () => {},
  t: (k, fallback) => fallback || k,
  locales: ['en', 'am', 'om'] as const,
  localeMetadata,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    async function loadLocale() {
      try {
        let stored: string | null = null;
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.localStorage) {
            stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
          } else {
            stored = memoryLocale;
          }
        } else {
          stored = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
        }
        if (stored === 'en' || stored === 'am' || stored === 'om') {
          setLocaleState(stored);
        }
      } catch {
        // Fallback to English
      }
    }
    void loadLocale();
  }, []);

  const setLocale = async (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
        }
        memoryLocale = newLocale;
      } else {
        await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, newLocale);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const t = (key: string, fallback?: string): string => {
    return translations[locale]?.[key] ?? translations.en[key] ?? fallback ?? key;
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      locales: ['en', 'am', 'om'] as const,
      localeMetadata,
    }),
    [locale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
