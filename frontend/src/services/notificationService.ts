import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alarm } from './patientService';
import { dbTime, formatHora } from '../utils/datetime';

// Canal de prioridad máxima: en Android la importancia de un canal ya creado no
// se puede subir, por eso el id es nuevo y no el anterior ('medicamentos').
const ANDROID_CHANNEL_ID = 'medicamentos-alta';
const BATTERY_TIP_KEY = 'tusalud_aviso_bateria_v1';

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
    // Sin la propiedad `sound` se usa el sonido de notificación del sistema.
    // No poner 'default': ese campo espera el nombre de un archivo incluido en
    // la app, y la palabra 'default' hace que el módulo nativo lo reporte como
    // sonido faltante en cada arranque.
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Medicamentos',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
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
    priority: Notifications.AndroidNotificationPriority.MAX,
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
    if (a.patient_medicine_id == null || a.state !== 0) continue;
    const when = dbTime(a.alarm_datetime);
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


/**
 * Algunos celulares cierran las apps en segundo plano para ahorrar batería y la
 * notificación de la alarma no llega. Se avisa una sola vez al paciente para que
 * quite la restricción de batería de TUSALUD+.
 */
export async function recommendDisableBatterySaver(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    if (await AsyncStorage.getItem(BATTERY_TIP_KEY)) return;
    await AsyncStorage.setItem(BATTERY_TIP_KEY, '1');
  } catch {
    return;
  }
  Alert.alert(
    'Para que las alarmas lleguen siempre',
    'Algunos celulares cierran la app para ahorrar batería y la alarma de tu medicamento puede no sonar. ' +
      'Te recomendamos quitar la restricción de batería de TUSALUD+ en los ajustes del celular.',
    [
      { text: 'Ahora no', style: 'cancel' },
      { text: 'Abrir ajustes', onPress: () => { void Linking.openSettings(); } },
    ]
  );
}

/** Aviso local al cuidador cuando el paciente marca NO LO TOMÉ. */
export async function notifyCaregiverMissedDose(
  patientName: string,
  alarmTitle: string,
  alarmDatetime: string
): Promise<void> {
  const ok = await ensureNotificationSetup();
  if (!ok) return;

  const medicamento = alarmTitle.replace(/^Toma:\s*/i, '');
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Toma no realizada',
      body: `${patientName} marcó NO LO TOMÉ: ${medicamento} (${formatHora(alarmDatetime)}).`,
      data: { tipo: 'toma_no_tomada' },
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
    },
  });
}
