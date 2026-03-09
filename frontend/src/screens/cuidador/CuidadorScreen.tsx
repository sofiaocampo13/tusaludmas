<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, Linking } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { API_BASE_URL } from '../../config/api';
=======
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { API_BASE_URL } from '../../config/api';
import type { CuidadorUser, PatientLinked, NotificacionEmergente } from '../../types/database';
>>>>>>> 9ffd24b (Cambios locales antes de sincronizar con main)

// Funciones de ayuda existentes
function formatAlarmTime(alarm_datetime: string): string {
  try {
    const d = new Date(alarm_datetime);
    return d.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return alarm_datetime;
  }
}

function getDisplayName(user: { first_name?: string | null; last_name?: string | null; fullName?: string; username?: string }): string {
  if (user.fullName) return user.fullName;
  const first = user.first_name ?? '';
  const last = user.last_name ?? '';
  const name = `${first} ${last}`.trim();
  return name || user.username || '';
}

function generateCalendarDays(): { num: string; label: string; isToday: boolean }[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const days = [];
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      num: date.getDate().toString(),
      label: dayLabels[i],
      isToday: date.toDateString() === today.toDateString(),
    });
  }
  return days;
}

const DIAS_CALENDARIO = generateCalendarDays();
const NOTIFICACIONES_EJEMPLO: NotificacionEmergente[] = [
  { id: 1, type: 'toma', title: 'Toma', detail: 'Medicamento', alarm_datetime: new Date().toISOString(), patient_medicine_id: 1 },
];

export interface CuidadorScreenProps {
  user: CuidadorUser;
  patient?: PatientLinked | null;
  notificaciones?: NotificacionEmergente[];
}

export default function CuidadorScreen({ user, patient = null, notificaciones = NOTIFICACIONES_EJEMPLO }: CuidadorScreenProps) {
  const userName = getDisplayName(user);
  
  // --- LÓGICA DE MAPAS ADICIONADA ---
  const [pacienteInfo, setPacienteInfo] = useState<any>(null);
  const [loadingMap, setLoadingMap] = useState(true);

  const fetchLocation = async () => {
    try {
      // Usamos el roleId del usuario para buscar la ubicación del paciente vinculado
      const url = `${API_BASE_URL}/patients/location/${user.roles_id}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success && result.data) {
        setPacienteInfo(result.data);
      }
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
    } finally {
      setLoadingMap(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    const interval = setInterval(fetchLocation, 15000); // Actualización cada 15 segundos
    return () => clearInterval(interval);
  }, []);

  const handleCall = () => {
    const phone = pacienteInfo?.phone || (patient as any)?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const currentPatientName = pacienteInfo?.first_name || (patient ? getDisplayName(patient) : 'Paciente');

<<<<<<< HEAD
export default function CuidadorScreen({ user }: any) {
  // Daniel: Estados para la ubicación y datos del paciente
  const [pacienteInfo, setPacienteInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocation = async () => {
    try {
      // Daniel: Volvemos a la forma dinámica para que reconozca a cualquier cuidador
      const url = `${API_BASE_URL}/patients/location/${user.roleId}`;
      console.log("Daniel - Consultando URL:", url); // Verifica que el ID sea 3

      const response = await fetch(url);
      const result = await response.json();
      
      console.log("Daniel - Respuesta completa del servidor:", JSON.stringify(result, null, 2));

      if (result.success && result.data) {
        console.log("Daniel - Coordenadas encontradas:", result.data.latitude, result.data.longitude);
        setPacienteInfo(result.data);
      } else {
        console.warn("Daniel - El servidor no encontró datos para este ID");
      }
    } catch (error) {
      console.error("Daniel - Error en el fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    // Daniel: Actualización automática cada 15 segundos para tiempo real
    const interval = setInterval(fetchLocation, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCall = () => {
    if (pacienteInfo?.phone) {
      Linking.openURL(`tel:${pacienteInfo.phone}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
=======
  return (
    <SafeAreaView style={styles.container}>
>>>>>>> 9ffd24b (Cambios locales antes de sincronizar con main)
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TUSALUD+</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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

<<<<<<< HEAD
        {/* Resumen Diario */}
        <View style={styles.summaryCard}>
          <Text style={styles.monthTitle}>Marzo</Text>
          <Text style={styles.subSubtitle}>Actividades de hoy</Text>
          
          <View style={styles.timelineItem}>
            <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Toma Confirmada</Text>
              <Text style={styles.activityDetail}>Medicamento: Atorvastatina</Text>
              <Text style={styles.activityTime}><Ionicons name="time-outline" /> 1:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Daniel: Mapa Real del Paciente */}
        <Text style={styles.sectionLabel}>
          Ubicación de {pacienteInfo ? pacienteInfo.first_name : 'Paciente'}
        </Text>
        
        <View style={styles.mapContainer}>
          {loading ? (
=======
        <View style={styles.summaryCard}>
          <Text style={styles.monthTitle}>Marzo</Text>
          <View style={styles.calendarStrip}>
            {DIAS_CALENDARIO.map((d) => (
              <View key={d.num} style={[styles.calendarDay, d.isToday && styles.calendarDayActive]}>
                <Text style={[styles.calendarDayNum, d.isToday && styles.calendarDayTextActive]}>{d.num}</Text>
                <Text style={[styles.calendarDayLabel, d.isToday && styles.calendarDayTextActive]}>{d.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.subSubtitle}>{notificaciones.filter((n) => n.type === 'toma').length} toma(s) hoy</Text>

          {notificaciones.map((notif) => (
            <View key={notif.id} style={styles.timelineItem}>
              <View style={[styles.pillIcon, { backgroundColor: '#2196F3' }]}>
                {notif.type === 'toma' ? (
                  <FontAwesome5 name="pills" size={14} color="#FFF" />
                ) : (
                  <Ionicons name="calendar" size={14} color="#FFF" />
                )}
              </View>
              <View style={styles.activityInfo}>
                <View style={styles.activityRow}>
                  <Text style={styles.activityTitle}>{notif.title}</Text>
                  <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Ionicons name="ellipsis-vertical" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
                {notif.detail ? <Text style={styles.activityDetail}>{notif.detail}</Text> : null}
                <Text style={styles.activityTime}>
                  <Ionicons name="time-outline" size={14} /> {formatAlarmTime(notif.alarm_datetime)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* --- SECCIÓN DE MAPA INTEGRADA --- */}
        <Text style={styles.sectionLabel}>Ubicación de {currentPatientName}</Text>
        <View style={styles.mapContainer}>
          {loadingMap ? (
>>>>>>> 9ffd24b (Cambios locales antes de sincronizar con main)
            <ActivityIndicator size="large" color="#2196F3" />
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
                coordinate={{
                  latitude: parseFloat(pacienteInfo.latitude),
                  longitude: parseFloat(pacienteInfo.longitude),
                }}
<<<<<<< HEAD
                title={pacienteInfo.first_name}
                description="Ubicación actual del paciente"
              >
                <View style={styles.markerContainer}>
=======
                title={currentPatientName}
                description="Ubicación actual"
              >
                <View style={styles.markerWrapper}>
>>>>>>> 9ffd24b (Cambios locales antes de sincronizar con main)
                  <Ionicons name="person-circle" size={40} color="#2196F3" />
                </View>
              </Marker>
            </MapView>
          ) : (
<<<<<<< HEAD
            <Text style={styles.noDataText}>Buscando señal GPS...</Text>
          )}

          {/* Botón de Llamada Dinámico */}
          <TouchableOpacity style={styles.locationOverlay} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#004282" />
            <Text style={styles.locationText}>
              Llamar a {pacienteInfo?.first_name || 'Carlos'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={24} color="#004282" />
          <Text style={[styles.tabLabel, { color: '#004282' }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <FontAwesome5 name="pills" size={22} color="#999" />
          <Text style={styles.tabLabel}>Medicamento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="calendar" size={24} color="#999" />
          <Text style={styles.tabLabel}>Agendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person" size={24} color="#999" />
          <Text style={styles.tabLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
=======
            <Text style={{ color: '#666', fontStyle: 'italic' }}>Buscando señal GPS...</Text>
          )}

          <TouchableOpacity style={styles.locationOverlay} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#004282" />
            <Text style={styles.locationText}>Llamar a {currentPatientName}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
>>>>>>> 9ffd24b (Cambios locales antes de sincronizar con main)
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { backgroundColor: '#2196F3', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'flex-start' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  scrollContent: { padding: 20 },
  welcomeSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#666' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  summaryCard: { backgroundColor: '#F8F9FA', borderRadius: 15, padding: 20, elevation: 2 },
  monthTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  calendarStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  calendarDay: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 10, minWidth: 36 },
  calendarDayActive: { backgroundColor: '#2196F3' },
  calendarDayNum: { fontSize: 14, color: '#999' },
  calendarDayLabel: { fontSize: 11, color: '#999' },
  calendarDayTextActive: { color: '#FFF', fontWeight: 'bold' },
  subSubtitle: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  pillIcon: { width: 28, height: 28, borderRadius: 14, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  activityTitle: { fontWeight: 'bold', fontSize: 14 },
  activityDetail: { color: '#666', fontSize: 12 },
  activityTime: { fontSize: 12, color: '#2196F3', marginTop: 4 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 10 },
  mapContainer: { height: 250, borderRadius: 15, backgroundColor: '#E0E0E0', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  locationOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: '#FFF', padding: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  locationText: { marginLeft: 8, fontWeight: 'bold', color: '#004282' },
<<<<<<< HEAD
  bottomTab: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#EEE', paddingVertical: 10, backgroundColor: '#FFF' },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 10, color: '#999', marginTop: 4 },
  markerContainer: { backgroundColor: 'white', borderRadius: 20, padding: 2, elevation: 5 },
  noDataText: { color: '#666', fontStyle: 'italic' }
=======
  markerWrapper: { backgroundColor: 'white', borderRadius: 20, padding: 2, elevation: 5 },
>>>>>>> 9ffd24b (Cambios locales antes de sincronizar con main)
});