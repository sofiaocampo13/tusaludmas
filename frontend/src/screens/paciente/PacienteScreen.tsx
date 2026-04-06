import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications'; 
import { getPatientDashboard, updateAlarmState, Appointment, Alarm } from '../../services/patientService';
import {
  alarmIdFromNotificationData,
  scheduleMedicationAlarm,
  syncServerMedicationAlarms,
} from '../../services/notificationService'; 

// Formatear fecha para mostrar
const formatearFecha = (fechaStr: string) => {
  const d = new Date(fechaStr);
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return `${dias[d.getDay()]}, ${d.getDate()} ${d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
};

const formatearHora = (fechaStr: string) => {
  return new Date(fechaStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

export default function PacienteScreen({ user }: any) {
  const [citas, setCitas] = React.useState<Appointment[]>([]);
  const [alarmas, setAlarmas] = React.useState<Alarm[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [alarmaFlash, setAlarmaFlash] = React.useState<Alarm | null>(null);
  const [vistaActual, setVistaActual] = React.useState('inicio');
  
  // --- ESTADOS PARA EL MODAL ---
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

  const abrirModalDesdeNotificacion = React.useCallback((notification: Notifications.Notification) => {
    const content = notification.request.content;
    const data = content.data as Record<string, unknown> | undefined;
    const alarmId = alarmIdFromNotificationData(data);
    const fromTitle = (content.title ?? '').match(/medicina:\s*(.+?)!/i)?.[1]?.trim();
    const medNombre =
      typeof data?.medNombre === 'string' && data.medNombre.length > 0
        ? data.medNombre
        : fromTitle || 'Medicamento';
    const medDosis =
      typeof data?.medDosis === 'string' && data.medDosis.length > 0
        ? data.medDosis
        : (content.body ?? '').replace(/^Dosis:\s*/i, '') || '';

    setModalMed({
      title: content.title || 'Recordatorio',
      detail: content.body || '',
      alarmId,
      medNombre,
      medDosis: medDosis || 'Según indicación',
    });
    setModalVisible(true);
  }, []);

  const cargarDatos = React.useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await getPatientDashboard(user.id);
      if (data) {
        setCitas(data.appointments);
        setAlarmas(data.alarms);
        const ahora = new Date();
        const vencidasMed = data.alarms
          .filter(
            (a) =>
              a.patient_medicine_id != null &&
              a.state === 1 &&
              new Date(a.alarm_datetime).getTime() <= ahora.getTime()
          )
          .sort((a, b) => new Date(b.alarm_datetime).getTime() - new Date(a.alarm_datetime).getTime());
        setAlarmaFlash(vencidasMed[0] ?? null);

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

  React.useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);

    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      abrirModalDesdeNotificacion(notification);
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
      abrirModalDesdeNotificacion(response.notification);
    });

    return () => {
      clearInterval(interval);
      receivedSub.remove();
      responseSub.remove();
    };
  }, [cargarDatos, abrirModalDesdeNotificacion]);

  const cerrarModal = React.useCallback(() => {
    setModalVisible(false);
    setConfirmandoToma(false);
  }, []);

  const onYaLoTome = React.useCallback(async () => {
    if (modalMed.alarmId != null) {
      setConfirmandoToma(true);
      const ok = await updateAlarmState(modalMed.alarmId, 0);
      setConfirmandoToma(false);
      if (!ok) {
        console.warn('No se pudo marcar la alarma en el servidor');
      }
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

  const onNoLoTome = React.useCallback(() => {
    cerrarModal();
  }, [cerrarModal]);

  const medicamentos = alarmas.filter((a) => a.patient_medicine_id != null);
  
  const displayUser = {
    fullName: user?.fullName || 'Paciente Invitado',
    link_code: user?.link_code || '----'
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Encabezado Azul Curvo */}
      <View style={styles.blueHeader}>
        <Text style={styles.headerTitle}>TUSALUD+</Text>
        <View style={styles.userSection}>
          <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Buenos Días</Text>
            <Text style={styles.userName}>{displayUser.fullName}</Text>
          </View>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Tu código:</Text>
            <Text style={styles.codeValue}>{displayUser.link_code}</Text>
          </View>
        </View>
      </View>

      {/* --- BLOQUE CENTRAL --- */}
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
                onPress={() => scheduleMedicationAlarm("Atorvastatina", "10-40 mg/día")}
              >
                <Text style={{color: '#FFF', fontSize: 12, fontWeight: 'bold'}}>PROBAR ALARMA</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>IMPORTANTES</Text>

              {alarmaFlash && (
                <View style={[styles.card, styles.flashCard]}>
                  <Ionicons name="notifications" size={24} color="#FFF" />
                  <View style={styles.flashContent}>
                    <Text style={styles.cardDoctor}>Recordatorio activo</Text>
                    <Text style={styles.cardSub}>{alarmaFlash.title}</Text>
                  </View>
                </View>
              )}

              {citas.length > 0 && (
                <>
                  <Text style={styles.subsectionTitle}>Citas programadas</Text>
                  {citas.slice(0, 3).map((cita) => (
                    <View key={cita.id} style={[styles.card, { backgroundColor: '#3498DB' }]}>
                      <Text style={styles.cardDoctor}>Cita médica</Text>
                      <Text style={styles.cardSub}>{cita.description}</Text>
                      <View style={styles.badge}>
                        <Ionicons name="calendar" size={14} color="#FFF" />
                        <Text style={styles.badgeText}>{formatearFecha(cita.appointment_datetime)} • {formatearHora(cita.appointment_datetime)}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}

              {medicamentos.length > 0 && (
                <>
                  <Text style={styles.subsectionTitle}>Medicamentos</Text>
                  {medicamentos.slice(0, 5).map((med) => (
                    <View key={med.id} style={[styles.card, { backgroundColor: '#9B51E0' }]}>
                      <Text style={styles.cardDoctor}>{med.title}</Text>
                      <Text style={styles.cardSub}>Hora de toma</Text>
                      <View style={styles.badge}>
                        <Ionicons name="time" size={14} color="#FFF" />
                        <Text style={styles.badgeText}>{formatearHora(med.alarm_datetime)}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>MIS CITAS ASIGNADAS</Text>
              {citas.map((cita) => (
                <View key={cita.id} style={[styles.card, { backgroundColor: '#3498DB' }]}>
                  <Text style={styles.cardDoctor}>Cita médica</Text>
                  <Text style={styles.cardSub}>{cita.description}</Text>
                  <View style={styles.badge}>
                    <Ionicons name="calendar" size={14} color="#FFF" />
                    <Text style={styles.badgeText}>{formatearFecha(cita.appointment_datetime)} • {formatearHora(cita.appointment_datetime)}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* --- MODAL DE ALARMA --- */}
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
            <TouchableOpacity
              style={[styles.modalBtn, styles.btnGreen]}
              onPress={onYaLoTome}
              disabled={confirmandoToma}
            >
              {confirmandoToma ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>YA LO TOMÉ</Text>
              )}
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

      {/* Barra de Navegación */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setVistaActual('inicio')}>
          <Ionicons name="home" size={24} color={vistaActual === 'inicio' ? "#3498DB" : "#999"} />
          <Text style={[styles.tabText, vistaActual === 'inicio' && { color: '#3498DB' }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setVistaActual('citas')}>
          <Ionicons name={vistaActual === 'citas' ? "calendar" : "calendar-outline"} size={24} color={vistaActual === 'citas' ? "#3498DB" : "#999"} />
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
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#DDD' },
  userInfo: { flex: 1, marginLeft: 15 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  userName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  codeContainer: { alignItems: 'center' },
  codeLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  codeValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#666', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  subsectionTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginTop: 20, marginBottom: 10 },
  card: { padding: 20, borderRadius: 20, marginBottom: 15 },
  cardDoctor: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  cardSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 15 },
  badge: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  badgeText: { color: '#FFF', marginLeft: 5, fontSize: 12, fontWeight: 'bold' },
  flashCard: { backgroundColor: '#E74C3C', flexDirection: 'row', alignItems: 'center', gap: 12 },
  flashContent: { flex: 1 },
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
  btnGreen: { backgroundColor: '#A9B388' },
  btnOrange: { backgroundColor: '#FF8C00' },
  btnRed: { backgroundColor: '#FF4C4C' }
});