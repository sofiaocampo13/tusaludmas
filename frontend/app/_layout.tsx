import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';

// Las notificaciones remotas no están disponibles en Expo Go SDK 53+.
// Solo usamos notificaciones locales, así que suprimimos este aviso.
LogBox.ignoreLogs(['expo-notifications: Android Push']);
import { updateAlarmState } from '../src/services/patientService';
import {
  alarmIdFromNotificationData,
  scheduleMedicationAlarm,
} from '../src/services/notificationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    async function configureNotifications() {
      await Notifications.setNotificationCategoryAsync('MEDICAMENTO', [
        {
          identifier: 'tomado',
          buttonTitle: 'YA LO TOMÉ',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'posponer',
          buttonTitle: 'POSPONER',
          options: { opensAppToForeground: true },
        },
      ]);
    }
    configureNotifications();

    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const action = response.actionIdentifier;
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      const alarmId = alarmIdFromNotificationData(data);
      const medNombre = typeof data?.medNombre === 'string' ? data.medNombre : 'Medicamento';
      const medDosis =
        typeof data?.medDosis === 'string' && data.medDosis.length > 0
          ? data.medDosis
          : 'Según indicación';

      if (action === 'tomado') {
        if (alarmId != null) await updateAlarmState(alarmId, 1);
        return;
      }
      if (action === 'posponer') {
        await scheduleMedicationAlarm(medNombre, medDosis, { alarmId, delaySeconds: 600 });
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
