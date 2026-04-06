import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import type { Alarm } from './patientService';

const ANDROID_CHANNEL_ID = 'medicamentos';

export const SYNC_MED_KEY = 'tusalud_med_v1';

export function alarmIdFromNotificationData(data: Record<string, unknown> | undefined): number | undefined {
  if (!data) return undefined;
  const raw = data.alarmId;
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  if (typeof raw === 'string') {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Medicamentos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }
}

export async function ensureNotificationSetup(): Promise<boolean> {
  await ensureAndroidChannel();
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const { status: next } = await Notifications.requestPermissionsAsync();
  return next === 'granted';
}

function buildMedicationContent(
  title: string,
  body: string,
  medNombre: string,
  medDosis: string,
  alarmId?: number
) {
  const data: Record<string, unknown> = {
    syncKey: SYNC_MED_KEY,
    medNombre,
    medDosis,
  };
  if (alarmId != null) data.alarmId = alarmId;

  return {
    title,
    body,
    data,
    categoryIdentifier: 'MEDICAMENTO',
  };
}

export const scheduleMedicationAlarm = async (
  nombre: string,
  dosis: string,
  options?: { alarmId?: number; delaySeconds?: number }
) => {
  const ok = await ensureNotificationSetup();
  if (!ok) {
    Alert.alert('Permiso denegado', 'Necesitamos permisos para avisarte de tus medicinas.');
    return;
  }

  const delaySeconds = Math.max(1, options?.delaySeconds ?? 5);
  const title = `¡Hora de tu medicina: ${nombre}!`;
  const body = `Dosis: ${dosis}`;

  await Notifications.scheduleNotificationAsync({
    content: buildMedicationContent(title, body, nombre, dosis, options?.alarmId),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
      channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
    },
  });
};

/**
 * Cancela notificaciones locales programadas por esta app para medicamentos y vuelve a crear
 * las que aún están en el futuro (según el dashboard).
 */
export async function syncServerMedicationAlarms(alarms: Alarm[]): Promise<void> {
  const ok = await ensureNotificationSetup();
  if (!ok) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const req of scheduled) {
    const sk = req.content.data?.syncKey;
    if (sk === SYNC_MED_KEY) {
      await Notifications.cancelScheduledNotificationAsync(req.identifier);
    }
  }

  const now = Date.now();
  for (const a of alarms) {
    if (a.patient_medicine_id == null || a.state !== 1) continue;
    const when = new Date(a.alarm_datetime).getTime();
    if (when <= now) continue;

    const title = `¡Hora de tu medicina: ${a.title}!`;
    const body = 'Abre la app para confirmar si ya la tomaste.';
    const dosis = 'Según indicación médica';

    await Notifications.scheduleNotificationAsync({
      content: buildMedicationContent(title, body, a.title, dosis, a.id),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(when),
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
      },
    });
  }
}
