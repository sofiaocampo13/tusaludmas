import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { updateAlarmState } from '../src/services/patientService';
import {
  alarmIdFromNotificationData,
  scheduleMedicationAlarm,
} from '../src/services/notificationService';

// 1. Configuración global de comportamiento de alertas
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
    // 2. Definimos Y LLAMAMOS a la configuración de categorías
    async function configureNotifications() {
      await Notifications.setNotificationCategoryAsync('MEDICAMENTO', [
        {
          identifier: 'tomado',
          buttonTitle: 'YA LO TOMÉ',
          options: { 
            opensAppToForeground: true // Correcto para versiones nuevas
          }
        },
        {
          identifier: 'posponer',
          buttonTitle: 'POSPONER',
          options: { opensAppToForeground: true }
        }
      ]);
    }

    configureNotifications(); // <--- IMPORTANTE: Hay que ejecutarla

    // 3. Escuchador de respuesta a notificaciones
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
        if (alarmId != null) {
          await updateAlarmState(alarmId, 0);
        }
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