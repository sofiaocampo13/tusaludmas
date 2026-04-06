import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Linking, Alert, Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { API_BASE_URL } from '../../config/api';
import { listPatientAlarmas, omitirAlarma, editarAlarma, eliminarAlarma } from '../../services/dataService';
import type { CuidadorUser, PatientLinked, NotificacionEmergente } from '../../types/database';

// ─── Helpers de fecha (local, sin conversión UTC) ───────────────────────────

function localDateString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function todayString(): string {
  return localDateString(new Date());
}

function alarmToLocalDateString(alarm_datetime: string): string {
  return localDateString(new Date(alarm_datetime.replace(' ', 'T')));
}

function formatAlarmTime(alarm_datetime: string): string {
  try {
    const d = new Date(alarm_datetime.replace(' ', 'T'));
    return d.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return alarm_datetime;
  }
}

function getDisplayName(user: {
  first_name?: string | null; last_name?: string | null;
  fullName?: string; username?: string;
}): string {
  if (user.fullName) return user.fullName;
  const name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  return name || user.username || '';
}

function generateWeekDays(weekOffset: number) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  const todayStr = todayString();
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const fullDate = localDateString(d);
    return { num: d.getDate().toString(), label: dayLabels[i], isToday: fullDate === todayStr, fullDate };
  });
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ─── Props ───────────────────────────────────────────────────────────────────

export interface CuidadorScreenProps {
  user: CuidadorUser;
  patient?: PatientLinked | null;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function CuidadorScreen({ user, patient = null }: CuidadorScreenProps) {
  const userName = getDisplayName(user);

  const [pacienteInfo, setPacienteInfo]       = useState<any>(null);
  const [loadingMap, setLoadingMap]           = useState(true);

  // Todas las alarmas cacheadas (sin filtrar por fecha)
  const [todasLasAlarmas, setTodasLasAlarmas] = useState<NotificacionEmergente[]>([]);
  const [loadingAlarmas, setLoadingAlarmas]   = useState(true);

  // Calendario
  const [weekOffset, setWeekOffset]           = useState(0);
  const [selectedDate, setSelectedDate]       = useState(todayString());

  // Menú de opciones (bottom sheet)
  const [menuNotif, setMenuNotif]             = useState<NotificacionEmergente | null>(null);

  // Editor de hora
  const [alarmEditando, setAlarmEditando]     = useState<NotificacionEmergente | null>(null);
  const [showEditPicker, setShowEditPicker]   = useState(false);

  // ── Derivados ────────────────────────────────────────────────────────────
  const weekDays      = generateWeekDays(weekOffset);
  const alarmasDia    = todasLasAlarmas.filter(n => alarmToLocalDateString(n.alarm_datetime) === selectedDate);
  const isPastAlarm   = menuNotif ? new Date(menuNotif.alarm_datetime.replace(' ', 'T')) < new Date() : false;

  const firstDayOfWeek = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + weekOffset * 7);
    return d;
  })();
  const weekMonthLabel = MONTH_NAMES[firstDayOfWeek.getMonth()] +
    (weekOffset !== 0 ? ` ${firstDayOfWeek.getFullYear()}` : '');

  const esFechaHoy = selectedDate === todayString();

  // ── Fetch ubicación ──────────────────────────────────────────────────────
  const fetchLocation = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/location/${user.id}`);
      const data = await res.json();
      if (data.success && data.data) setPacienteInfo(data.data);
    } catch (e) {
      console.error('Error obteniendo ubicación:', e);
    } finally {
      setLoadingMap(false);
    }
  };

  // ── Fetch alarmas (sin filtro de fecha, filtramos en UI) ─────────────────
  const fetchAlarmasReales = async () => {
    const pId = patient?.id || pacienteInfo?.id;
    if (!pId) { setLoadingAlarmas(false); return; }
    try {
      setLoadingAlarmas(true);
      const res = await listPatientAlarmas(pId);
      if (res.success && Array.isArray(res.alarmas)) {
        setTodasLasAlarmas(
          res.alarmas
            .filter((a: any) => a.alarm_datetime && a.state !== 2)
            .map((a: any) => ({
              id: a.id,
              type: 'toma' as const,
              title: a.title,
              detail: 'Medicamento programado',
              alarm_datetime: a.alarm_datetime,
              patient_medicine_id: a.patient_medicine_id,
              state: a.state ?? 0,
            }))
        );
      }
    } catch (e) {
      console.error('Error al cargar alarmas:', e);
    } finally {
      setLoadingAlarmas(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    const interval = setInterval(fetchLocation, 15000);
    return () => clearInterval(interval);
  }, [patient?.id, pacienteInfo?.id]);

  // Re-fetch alarmas cada vez que el tab gana foco (ej: al volver desde Medicamento)
  useFocusEffect(
    useCallback(() => {
      fetchAlarmasReales();
    }, [patient?.id, pacienteInfo?.id])
  );

  // ── Handlers opciones ────────────────────────────────────────────────────
  const handleOmitir = (notif: NotificacionEmergente) => {
    setMenuNotif(null);
    Alert.alert('Omitir toma', '¿Deseas omitir esta toma?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Omitir', style: 'destructive',
        onPress: async () => {
          try {
            await omitirAlarma(notif.id);
            setTodasLasAlarmas(prev => prev.filter(n => n.id !== notif.id));
          } catch {
            Alert.alert('Error', 'No se pudo omitir la alarma.');
          }
        },
      },
    ]);
  };

  const handleEliminar = (notif: NotificacionEmergente) => {
    setMenuNotif(null);
    Alert.alert('Eliminar alarma', '¿Deseas eliminar esta alarma?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await eliminarAlarma(notif.id);
            setTodasLasAlarmas(prev => prev.filter(n => n.id !== notif.id));
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la alarma.');
          }
        },
      },
    ]);
  };

  const handleCall = () => {
    const phone = pacienteInfo?.phone || (patient as any)?.phone;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const currentPatientName =
    pacienteInfo?.first_name || (patient ? getDisplayName(patient) : 'Paciente');

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>TUSALUD+</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Bienvenida */}
        <View style={styles.welcomeSection}>
          {user.profile_picture ? (
            <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={30} color="#666" />
            </View>
          )}
          <View>
            <Text style={styles.greeting}>Buenos Días</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>

        {/* Calendario + tomas */}
        <View style={styles.summaryCard}>

          {/* Navegación de semana */}
          <View style={styles.calendarNavRow}>
            <TouchableOpacity onPress={() => setWeekOffset(w => w - 1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-back" size={22} color="#333" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{weekMonthLabel}</Text>
            <TouchableOpacity onPress={() => setWeekOffset(w => w + 1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-forward" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarStrip}>
            {weekDays.map((d) => {
              const isSelected = d.fullDate === selectedDate;
              return (
                <TouchableOpacity
                  key={d.fullDate}
                  style={[
                    styles.calendarDay,
                    isSelected && styles.calendarDaySelected,
                  ]}
                  onPress={() => setSelectedDate(d.fullDate)}
                >
                  <Text style={[styles.calendarDayNum, isSelected && styles.calendarDayTextActive]}>
                    {d.num}
                  </Text>
                  <Text style={[styles.calendarDayLabel, isSelected && styles.calendarDayTextActive]}>
                    {d.label}
                  </Text>
                  {/* Punto indicador de "hoy" si no está seleccionado */}
                  {d.isToday && !isSelected && <View style={styles.todayDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.subSubtitle}>
            {alarmasDia.length} toma(s) {esFechaHoy ? 'hoy' : `el ${selectedDate}`}
          </Text>

          {loadingAlarmas ? (
            <ActivityIndicator color="#004080" />
          ) : alarmasDia.length > 0 ? (
            alarmasDia.map((notif) => (
              <View key={notif.id} style={styles.timelineItem}>
                <View style={[styles.pillIcon, { backgroundColor: notif.state === 1 ? '#4CAF50' : '#004080' }]}>
                  <FontAwesome5 name="pills" size={14} color="#FFF" />
                </View>
                <View style={[styles.activityInfo, notif.state === 1 && styles.activityInfoTomada]}>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityTitle} numberOfLines={2}>{notif.title}</Text>
                    <TouchableOpacity onPress={() => setMenuNotif(notif)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="ellipsis-vertical" size={18} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.activityDetail}>
                    {notif.state === 1 ? 'Tomada' : 'Medicamento programado'}
                  </Text>
                  <Text style={styles.activityTime}>
                    <Ionicons name="time-outline" size={14} /> {formatAlarmTime(notif.alarm_datetime)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Sin tomas para este día</Text>
          )}
        </View>

        {/* Mapa */}
        <Text style={styles.sectionLabel}>Ubicación de {currentPatientName}</Text>
        <View style={styles.mapContainer}>
          {loadingMap ? (
            <ActivityIndicator size="large" color="#004080" />
          ) : pacienteInfo?.latitude ? (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFillObject}
              region={{
                latitude: parseFloat(pacienteInfo.latitude),
                longitude: parseFloat(pacienteInfo.longitude),
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{ latitude: parseFloat(pacienteInfo.latitude), longitude: parseFloat(pacienteInfo.longitude) }}
                title={currentPatientName}
                description="Ubicación actual"
              >
                <View style={styles.markerWrapper}>
                  <Ionicons name="person-circle" size={40} color="#004080" />
                </View>
              </Marker>
            </MapView>
          ) : (
            <Text style={{ color: '#666', fontStyle: 'italic' }}>Buscando señal GPS...</Text>
          )}
          <TouchableOpacity style={styles.locationOverlay} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#004282" />
            <Text style={styles.locationText}>Llamar a {currentPatientName}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── Bottom sheet de opciones ────────────────────────────────────── */}
      <Modal
        visible={!!menuNotif}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuNotif(null)}
      >
        {/* Toca el fondo oscuro para cerrar */}
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setMenuNotif(null)}
          activeOpacity={1}
        />
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />
          <Text style={styles.bottomSheetTitle} numberOfLines={2}>{menuNotif?.title}</Text>
          <Text style={styles.bottomSheetTime}>
            {menuNotif ? formatAlarmTime(menuNotif.alarm_datetime) : ''}
          </Text>

          {/* Editar solo si la toma NO es pasada */}
          {!isPastAlarm && (
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setMenuNotif(null);
                setAlarmEditando(menuNotif);
                setShowEditPicker(true);
              }}
            >
              <Ionicons name="pencil-outline" size={20} color="#004080" />
              <Text style={[styles.sheetOptionText, { color: '#004080' }]}>Editar hora</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.sheetOption} onPress={() => handleOmitir(menuNotif!)}>
            <Ionicons name="close-circle-outline" size={20} color="#FF9800" />
            <Text style={[styles.sheetOptionText, { color: '#FF9800' }]}>Omitir toma</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sheetOption} onPress={() => handleEliminar(menuNotif!)}>
            <Ionicons name="trash-outline" size={20} color="#F44336" />
            <Text style={[styles.sheetOptionText, { color: '#F44336' }]}>Eliminar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.sheetOption, styles.sheetCancelRow]} onPress={() => setMenuNotif(null)}>
            <Text style={styles.sheetCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── DateTimePicker para editar hora ────────────────────────────── */}
      {showEditPicker && alarmEditando && (
        <DateTimePicker
          value={new Date(alarmEditando.alarm_datetime.replace(' ', 'T'))}
          mode="time"
          is24Hour={true}
          onChange={async (e, newDate) => {
            setShowEditPicker(false);
            if (e.type === 'dismissed' || !newDate) return;

            const base = new Date(alarmEditando.alarm_datetime.replace(' ', 'T'));
            base.setHours(newDate.getHours(), newDate.getMinutes(), 0, 0);
            const pad = (n: number) => n.toString().padStart(2, '0');
            const nuevaFecha = `${base.getFullYear()}-${pad(base.getMonth()+1)}-${pad(base.getDate())} ${pad(base.getHours())}:${pad(base.getMinutes())}:00`;

            try {
              await editarAlarma(alarmEditando.id, nuevaFecha);
              setTodasLasAlarmas(prev =>
                prev.map(n => n.id === alarmEditando.id ? { ...n, alarm_datetime: nuevaFecha } : n)
              );
            } catch {
              Alert.alert('Error', 'No se pudo actualizar la hora.');
            }
            setAlarmEditando(null);
          }}
        />
      )}

    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { backgroundColor: '#004080', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'flex-start' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  scrollContent: { padding: 20 },
  welcomeSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#666' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  summaryCard: { backgroundColor: '#F8F9FA', borderRadius: 15, padding: 20, elevation: 2 },

  // Calendario
  calendarNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  calendarStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  calendarDay: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 10, minWidth: 36 },
  calendarDaySelected: { backgroundColor: '#004080' },
  calendarDayNum: { fontSize: 14, color: '#999' },
  calendarDayLabel: { fontSize: 11, color: '#999' },
  calendarDayTextActive: { color: '#FFF', fontWeight: 'bold' },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#004080', marginTop: 3 },

  subSubtitle: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 12 },

  // Tomas
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  pillIcon: { width: 28, height: 28, borderRadius: 14, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  activityInfoTomada: { backgroundColor: '#F1F8F1', borderColor: '#C8E6C9' },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  activityTitle: { fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8 },
  activityDetail: { color: '#666', fontSize: 12 },
  activityTime: { fontSize: 12, color: '#004080', marginTop: 4 },

  // Mapa
  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 10 },
  mapContainer: { height: 250, borderRadius: 15, backgroundColor: '#E0E0E0', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  locationOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: '#FFF', padding: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  locationText: { marginLeft: 8, fontWeight: 'bold', color: '#004282' },
  markerWrapper: { backgroundColor: 'white', borderRadius: 20, padding: 2, elevation: 5 },

  // Bottom sheet
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 34 },
  bottomSheetHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  bottomSheetTitle: { fontWeight: 'bold', fontSize: 15, color: '#333', marginBottom: 4 },
  bottomSheetTime: { color: '#004080', fontSize: 13, marginBottom: 16 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderColor: '#F0F0F0' },
  sheetOptionText: { fontSize: 15, marginLeft: 12, fontWeight: '500' },
  sheetCancelRow: { justifyContent: 'center' },
  sheetCancelText: { textAlign: 'center', color: '#666', fontSize: 15, fontWeight: '500' },
});
