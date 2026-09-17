import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, BackHandler, Alert, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { getPatientDashboard, updateAlarmState, Appointment, Alarm } from '../../services/patientService';
import { omitirAlarma } from '../../services/dataService';
import {
  alarmIdFromNotificationData,
  scheduleMedicationAlarm,
  syncServerMedicationAlarms,
} from '../../services/notificationService';

// ── Helpers de formato ──────────────────────────────────────────────────────
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const formatearHora = (fechaStr: string) =>
  new Date(fechaStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

const formatearDiaCorto = (fechaStr: string) => {
  const d = new Date(fechaStr);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
};

const formatearFechaHora = (fechaStr: string) => {
  const d = new Date(fechaStr);
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return `${dias[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()} · ${formatearHora(fechaStr)}`;
};

const nombreMed = (title: string) => title.replace(/^Toma:\s*/i, '');

const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

// ── Agrupación de medicamentos vigentes ────────────────────────────────────
// Usa comparación de string YYYY-MM-DD para evitar problemas de zona horaria
const fechaStr = (dt: string) => dt.slice(0, 10); // "2026-04-09"

// Construye "YYYY-MM-DD" desde un Date en hora local, sin depender de toLocaleDateString
const localDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

interface GrupoMed {
  key: string;
  nombre: string;
  hora: string;
  fechaInicio: string;
  fechaFin: string;
  ids: number[];
}

const agruparVigentes = (alarms: Alarm[], todayStr: string): GrupoMed[] => {
  const mapa = new Map<string, GrupoMed>();

  const vigentes = alarms
    .filter((a) => a.patient_medicine_id != null && a.state === 0 && fechaStr(a.alarm_datetime) >= todayStr)
    .sort((a, b) => new Date(a.alarm_datetime).getTime() - new Date(b.alarm_datetime).getTime());

  for (const a of vigentes) {
    const hora = formatearHora(a.alarm_datetime);
    const nombre = nombreMed(a.title);
    const key = `${nombre}|${hora}`;
    if (!mapa.has(key)) {
      mapa.set(key, { key, nombre, hora, fechaInicio: a.alarm_datetime, fechaFin: a.alarm_datetime, ids: [] });
    }
    const g = mapa.get(key)!;
    g.fechaFin = a.alarm_datetime;
    g.ids.push(a.id);
  }

  return Array.from(mapa.values());
};

// ── Componente ──────────────────────────────────────────────────────────────
export default function PacienteScreen({ user }: any) {
  const router = useRouter();
  const [citas, setCitas] = React.useState<Appointment[]>([]);
  const [alarmas, setAlarmas] = React.useState<Alarm[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [alarmaFlash, setAlarmaFlash] = React.useState<Alarm | null>(null);
  const [vistaActual, setVistaActual] = React.useState('inicio');

  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalMed, setModalMed] = React.useState<{
    title: string;
    detail: string;
    alarmId?: number;
    medNombre: string;
    medDosis: string;
  }>({ title: '', detail: '', medNombre: '', medDosis: '' });
  const [confirmandoToma, setConfirmandoToma] = React.useState(false);
  const ultimaSyncAlarmasRef = React.useRef<string>('');

  const abrirModalDesdeNotificacion = React.useCallback((
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) => {
    const alarmId = alarmIdFromNotificationData(data);
    const fromTitle = title.match(/medicina:\s*(.+?)!/i)?.[1]?.trim();
    const medNombre = (typeof data?.medNombre === 'string' ? data.medNombre : null) || fromTitle || 'Medicamento';
    const medDosis = (typeof data?.medDosis === 'string' ? data.medDosis : null) || body.replace(/^Dosis:\s*/i, '') || 'Según indicación';
    setModalMed({ title: title || 'Recordatorio', detail: body || '', alarmId, medNombre, medDosis });
    setModalVisible(true);
  }, []);

  const cargarDatos = React.useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const data = await getPatientDashboard(user.id);
      if (data) {
        setCitas(data.appointments);
        setAlarmas(data.alarms);

        // Alarma flash: alarmas de HOY (pasadas primero, luego próximas)
        const ahora = new Date();
        const hoyStr = localDateStr(ahora);

        const alarmasHoy = data.alarms.filter(
          (a) => a.patient_medicine_id != null && a.state === 0 && a.alarm_datetime.slice(0, 10) === hoyStr
        );
        const pasadasHoy = alarmasHoy
          .filter((a) => new Date(a.alarm_datetime) <= ahora)
          .sort((a, b) => new Date(b.alarm_datetime).getTime() - new Date(a.alarm_datetime).getTime());
        const proximasHoy = alarmasHoy
          .filter((a) => new Date(a.alarm_datetime) > ahora)
          .sort((a, b) => new Date(a.alarm_datetime).getTime() - new Date(b.alarm_datetime).getTime());
        setAlarmaFlash(pasadasHoy[0] ?? proximasHoy[0] ?? null);

        const medKey = data.alarms
          .filter((a) => a.patient_medicine_id != null)
          .map((a) => `${a.id}:${a.alarm_datetime}:${a.state}`)
          .sort()
          .join('|');
        if (medKey !== ultimaSyncAlarmasRef.current) {
          ultimaSyncAlarmasRef.current = medKey;
          void syncServerMedicationAlarms(data.alarms);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Recargar al volver al primer plano
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') cargarDatos();
    });
    return () => sub.remove();
  }, [cargarDatos]);

  React.useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      const content = notification.request.content;
      abrirModalDesdeNotificacion(content.title ?? '', content.body ?? '', content.data as Record<string, string> | undefined);
    });
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
      const content = response.notification.request.content;
      abrirModalDesdeNotificacion(content.title ?? '', content.body ?? '', content.data as Record<string, string> | undefined);
    });
    return () => { clearInterval(interval); receivedSub.remove(); responseSub.remove(); };
  }, [cargarDatos, abrirModalDesdeNotificacion]);

  // Interceptar botón atrás de Android
  React.useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => router.replace('/auth/login') },
      ]);
      return true;
    });
    return () => handler.remove();
  }, [router]);

  const cerrarModal = React.useCallback(() => {
    setModalVisible(false);
    setConfirmandoToma(false);
  }, []);

  const onYaLoTome = React.useCallback(async () => {
    if (modalMed.alarmId != null) {
      setConfirmandoToma(true);
      const ok = await updateAlarmState(modalMed.alarmId, 1);
      setConfirmandoToma(false);
      if (!ok) console.warn('No se pudo marcar la alarma en el servidor');
      await cargarDatos();
    }
    cerrarModal();
  }, [modalMed.alarmId, cerrarModal, cargarDatos]);

  const onPosponer = React.useCallback(async () => {
    await scheduleMedicationAlarm(modalMed.medNombre, modalMed.medDosis, {
      alarmId: modalMed.alarmId,
      delaySeconds: 600,
    });
    cerrarModal();
  }, [modalMed.alarmId, modalMed.medNombre, modalMed.medDosis, cerrarModal]);

  const onNoLoTome = React.useCallback(() => cerrarModal(), [cerrarModal]);

  const omitirAlarmaAnterior = React.useCallback((alarm: Alarm) => {
    const nombre = nombreMed(alarm.title);
    const fecha = formatearFechaHora(alarm.alarm_datetime);
    Alert.alert(
      'Marcar como omitida',
      `¿Marcar "${nombre}" del ${fecha} como omitida?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Omitir',
          style: 'destructive',
          onPress: async () => {
            await omitirAlarma(alarm.id);
            await cargarDatos();
          },
        },
      ]
    );
  }, [cargarDatos]);

  // ── Datos derivados ────────────────────────────────────────────────────────
  const ahora = new Date();
  const todayStr = localDateStr(ahora); // "YYYY-MM-DD" en zona horaria local

  const gruposMed = agruparVigentes(alarmas, todayStr);

  const medPasadas = alarmas
    .filter((a) => a.patient_medicine_id != null && a.state === 0 && fechaStr(a.alarm_datetime) < todayStr)
    .sort((a, b) => new Date(b.alarm_datetime).getTime() - new Date(a.alarm_datetime).getTime());

  const citasPendientes = citas
    .filter((c) => new Date(c.appointment_datetime) > ahora)
    .sort((a, b) => new Date(a.appointment_datetime).getTime() - new Date(b.appointment_datetime).getTime());

  const citasAsistidas = citas
    .filter((c) => new Date(c.appointment_datetime) <= ahora)
    .sort((a, b) => new Date(b.appointment_datetime).getTime() - new Date(a.appointment_datetime).getTime());

  const displayUser = {
    fullName: user?.fullName || 'Paciente',
    link_code: user?.link_code || '----',
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.blueHeader}>
        <Text style={styles.headerTitle}>TUSALUD+</Text>
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{saludo()}</Text>
            <Text style={styles.userName}>{displayUser.fullName}</Text>
          </View>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Tu código:</Text>
            <Text style={styles.codeValue}>{displayUser.link_code}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Cargando tus datos...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {vistaActual === 'inicio' ? (
            <>
              <TouchableOpacity
                style={styles.btnTest}
                onPress={() => scheduleMedicationAlarm('Atorvastatina', '10-40 mg/día')}
              >
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>PROBAR ALARMA</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>IMPORTANTES</Text>

              {/* Alarma de medicamento vencida hoy */}
              {alarmaFlash && (() => {
                const esPasada = new Date(alarmaFlash.alarm_datetime) <= new Date();
                return (
                  <View style={[styles.card, esPasada ? styles.flashCardRojo : styles.flashCardNaranja]}>
                    <Ionicons name={esPasada ? 'notifications' : 'alarm-outline'} size={24} color="#FFF" />
                    <View style={styles.flashContent}>
                      <Text style={styles.cardDoctor}>{esPasada ? 'Dosis pendiente' : 'Próxima toma'}</Text>
                      <Text style={styles.cardSub}>{nombreMed(alarmaFlash.title)}</Text>
                      <View style={[styles.badge, { marginTop: 8 }]}>
                        <Ionicons name="time" size={14} color="#FFF" />
                        <Text style={styles.badgeText}>{formatearFechaHora(alarmaFlash.alarm_datetime)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })()}

              {citas.length === 0 && gruposMed.length === 0 && medPasadas.length === 0 && !alarmaFlash && (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle-outline" size={48} color="#C0D8F0" />
                  <Text style={styles.emptyText}>No tienes citas ni medicamentos pendientes</Text>
                </View>
              )}

              {/* Citas próximas */}
              <Text style={styles.subsectionTitle}>Citas programadas</Text>
              {citasPendientes.length > 0 ? (
                citasPendientes.slice(0, 3).map((cita) => (
                  <View key={cita.id} style={[styles.card, { backgroundColor: '#3498DB' }]}>
                    <Text style={styles.cardDoctor}>Cita médica</Text>
                    <Text style={styles.cardSub}>{cita.description}</Text>
                    <View style={styles.badge}>
                      <Ionicons name="calendar" size={14} color="#FFF" />
                      <Text style={styles.badgeText}>{formatearFechaHora(cita.appointment_datetime)}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.sinMedText}>No tienes citas pendientes en este momento</Text>
              )}

              {/* Medicamentos vigentes agrupados */}
              <Text style={styles.subsectionTitle}>Medicamentos pendientes</Text>
              {gruposMed.length > 0 ? (
                gruposMed.map((g) => {
                  const mismaFecha = formatearDiaCorto(g.fechaInicio) === formatearDiaCorto(g.fechaFin);
                  const rango = mismaFecha
                    ? formatearDiaCorto(g.fechaInicio)
                    : `del ${formatearDiaCorto(g.fechaInicio)} al ${formatearDiaCorto(g.fechaFin)}`;
                  return (
                    <View key={g.key} style={[styles.card, { backgroundColor: '#9B51E0' }]}>
                      <Text style={styles.cardDoctor}>{g.nombre}</Text>
                      <Text style={styles.cardSub}>{rango}</Text>
                      <View style={styles.badge}>
                        <Ionicons name="time" size={14} color="#FFF" />
                        <Text style={styles.badgeText}>{g.hora}</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.sinMedText}>No tienes medicamentos activos en este momento</Text>
              )}

              {/* Medicamentos anteriores (días pasados, pendientes de omitir) */}
              {medPasadas.length > 0 && (
                <>
                  <Text style={styles.subsectionTitle}>Medicamentos anteriores</Text>
                  <Text style={styles.hintText}>Toca uno para marcarlo como omitido</Text>
                  {medPasadas.map((med) => (
                    <TouchableOpacity
                      key={med.id}
                      style={styles.cardPasada}
                      onPress={() => omitirAlarmaAnterior(med)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cardPasadaLeft}>
                        <Text style={styles.cardPasadaNombre}>{nombreMed(med.title)}</Text>
                        <Text style={styles.cardPasadaFecha}>{formatearFechaHora(med.alarm_datetime)}</Text>
                      </View>
                      <Ionicons name="close-circle-outline" size={22} color="#C0392B" />
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>MIS CITAS</Text>

              {citas.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color="#C0D8F0" />
                  <Text style={styles.emptyText}>No tienes citas programadas</Text>
                </View>
              )}

              {citasPendientes.length > 0 && (
                <>
                  <Text style={styles.subsectionTitle}>Citas pendientes</Text>
                  {citasPendientes.map((cita) => (
                    <View key={cita.id} style={[styles.card, { backgroundColor: '#3498DB' }]}>
                      <Text style={styles.cardDoctor}>Cita médica</Text>
                      <Text style={styles.cardSub}>{cita.description}</Text>
                      <View style={styles.badge}>
                        <Ionicons name="calendar" size={14} color="#FFF" />
                        <Text style={styles.badgeText}>{formatearFechaHora(cita.appointment_datetime)}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}

              {citasAsistidas.length > 0 && (
                <>
                  <Text style={styles.subsectionTitle}>Citas asistidas</Text>
                  {citasAsistidas.map((cita) => (
                    <View key={cita.id} style={[styles.card, { backgroundColor: '#7F8C8D' }]}>
                      <Text style={styles.cardDoctor}>Cita médica</Text>
                      <Text style={styles.cardSub}>{cita.description}</Text>
                      <View style={styles.badge}>
                        <Ionicons name="checkmark-circle" size={14} color="#FFF" />
                        <Text style={styles.badgeText}>{formatearFechaHora(cita.appointment_datetime)}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Modal de alarma */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.pillIconContainer}>
                <Ionicons name="medical" size={24} color="#FF69B4" />
              </View>
              <Text style={styles.modalHeaderText}>ES HORA DE TOMAR TU MEDICAMENTO</Text>
            </View>
            <Text style={styles.modalDetailLabel}>{modalMed.title}</Text>
            <Text style={styles.modalMedText}>
              {modalMed.detail || `${modalMed.medNombre} — ${modalMed.medDosis}`}
            </Text>
            <TouchableOpacity style={[styles.modalBtn, styles.btnGreen]} onPress={onYaLoTome} disabled={confirmandoToma}>
              {confirmandoToma ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>YA LO TOMÉ</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.btnOrange]} onPress={onPosponer}>
              <Text style={styles.modalBtnText}>POSPONER (10 MIN)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.btnRed]} onPress={onNoLoTome}>
              <Text style={styles.modalBtnText}>NO LO TOMÉ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Barra de navegación */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setVistaActual('inicio')}>
          <Ionicons name="home" size={24} color={vistaActual === 'inicio' ? '#3498DB' : '#999'} />
          <Text style={[styles.tabText, vistaActual === 'inicio' && { color: '#3498DB' }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setVistaActual('citas')}>
          <Ionicons name={vistaActual === 'citas' ? 'calendar' : 'calendar-outline'} size={24} color={vistaActual === 'citas' ? '#3498DB' : '#999'} />
          <Text style={[styles.tabText, vistaActual === 'citas' && { color: '#3498DB' }]}>Citas</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  blueHeader: { backgroundColor: '#3498DB', paddingTop: 20, paddingBottom: 40, paddingHorizontal: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  userSection: { flexDirection: 'row', alignItems: 'center' },
  userInfo: { flex: 1 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  userName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  codeContainer: { alignItems: 'center' },
  codeLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  codeValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#666', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  subsectionTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginTop: 20, marginBottom: 6 },
  hintText: { fontSize: 12, color: '#AAA', marginBottom: 10 },
  sinMedText: { fontSize: 14, color: '#AAA', fontStyle: 'italic', marginBottom: 15 },
  card: { padding: 20, borderRadius: 20, marginBottom: 15 },
  cardDoctor: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  cardSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 15 },
  badge: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  badgeText: { color: '#FFF', marginLeft: 5, fontSize: 12, fontWeight: 'bold' },
  flashCard: { backgroundColor: '#E74C3C', flexDirection: 'row', alignItems: 'center', gap: 12 },
  flashCardRojo: { backgroundColor: '#E74C3C', flexDirection: 'row', alignItems: 'center', gap: 12 },
  flashCardNaranja: { backgroundColor: '#E67E22', flexDirection: 'row', alignItems: 'center', gap: 12 },
  flashContent: { flex: 1 },
  cardPasada: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FBBBB0', borderRadius: 14, padding: 14, marginBottom: 10 },
  cardPasadaLeft: { flex: 1 },
  cardPasadaNombre: { fontSize: 15, fontWeight: '600', color: '#C0392B' },
  cardPasadaFecha: { fontSize: 12, color: '#999', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { color: '#AAA', fontSize: 15, textAlign: 'center' },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#EEE', paddingVertical: 10 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabText: { fontSize: 12, marginTop: 4, color: '#999' },
  btnTest: { backgroundColor: '#3498DB', padding: 8, borderRadius: 20, alignSelf: 'flex-end', marginBottom: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 25, padding: 20, alignItems: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, width: '100%' },
  pillIconContainer: { marginRight: 10 },
  modalHeaderText: { fontSize: 14, fontWeight: 'bold', flex: 1, color: '#333' },
  modalDetailLabel: { fontSize: 13, color: '#888', marginBottom: 6, textAlign: 'center', width: '100%' },
  modalMedText: { fontSize: 18, borderBottomWidth: 1, borderBottomColor: '#EEE', width: '100%', textAlign: 'center', paddingBottom: 15, marginBottom: 20, color: '#444' },
  modalBtn: { width: '100%', paddingVertical: 12, borderRadius: 25, marginBottom: 10 },
  modalBtnText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 14 },
  btnGreen: { backgroundColor: '#27AE60' },
  btnOrange: { backgroundColor: '#FF8C00' },
  btnRed: { backgroundColor: '#FF4C4C' },
});
