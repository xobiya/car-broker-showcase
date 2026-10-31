import { Share } from 'react-native';
import * as Linking from 'expo-linking';

export async function openPhoneNumber(phone: string) {
  await Linking.openURL(`tel:${phone}`);
}

export async function openWhatsApp(phone: string, message: string) {
  const normalized = phone.replace(/\D/g, '');
  await Linking.openURL(`https://wa.me/${normalized}?text=${encodeURIComponent(message)}`);
}

export async function shareListing(url: string, message: string) {
  await Share.share({ message: `${message}\n${url}`, url });
}
