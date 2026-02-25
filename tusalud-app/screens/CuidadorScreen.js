import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';

export default function CuidadorScreen({ route }) {
  const { user } = route.params || { user: { username: 'marial' } };

  return (
    <View style={styles.container}>
      {/* Header con el notch visual del mockup */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TUSALUD+</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Perfil */}
        <View style={styles.profileSection}>
          <View>
            <Text style={styles.label}>Buenos Días</Text>
            <Text style={styles.mainName}>{user.fullName || user.username}</Text>
          </View>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=marial' }} style={styles.mainAvatar} />
        </View>

        {/* Mes y Contador de Tomas */}
        <View style={styles.calendarStrip}>
          <Text style={styles.monthText}>Marzo</Text>
          <Text style={styles.subText}>1 toma confirmada hoy</Text>
        </View>

        {/* Días de la semana (Selector) */}
        <View style={styles.daysRow}>
          {['09', '10', '11', '12', '13', '14', '15'].map((day, index) => (
            <View key={index} style={styles.dayItem}>
              <Text style={styles.dayNum}>{day}</Text>
              <Text style={[styles.dayName, day === '13' && styles.activeDayText]}>
                {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][index]}
              </Text>
              {day === '13' && <View style={styles.activeDot} />}
            </View>
          ))}
        </View>

        {/* Timeline de Actividades */}
        <View style={styles.timelineContainer}>
          {/* Toma de Medicamento */}
          <View style={styles.timelineRow}>
            <View style={styles.leftLine}>
              <View style={[styles.node, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.verticalLine} />
            </View>
            <TouchableOpacity style={styles.eventCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.eventTitle}>Toma Confirmada</Text>
                <Text style={styles.moreIcon}>⋮</Text>
              </View>
              <Text style={styles.eventDetail}>Medicamento: Atorvastatina</Text>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>🕒 1:00 PM</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Cita Médica */}
          <View style={styles.timelineRow}>
            <View style={styles.leftLine}>
              <View style={[styles.node, { backgroundColor: '#2185d0' }]} />
            </View>
            <TouchableOpacity style={styles.eventCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.eventTitle}>Cita Confirmada</Text>
                <Text style={styles.moreIcon}>⋮</Text>
              </View>
              <Text style={styles.eventDetail}>Cardiología</Text>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>🕒 10:30 - 11:30</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección Mapa / Ubicación de Carlos */}
        <Text style={styles.sectionTitle}>Ubicación de Juanp</Text>
        <View style={styles.mapCard}>
          <Image 
            source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=4.6097,-74.0817&zoom=14&size=400x200&key=TU_API_KEY' }} 
            style={styles.mapImage}
            defaultSource={{ uri: 'https://via.placeholder.com/400x150.png?text=Mapa+Cargando...' }}
          />
          <View style={styles.mapOverlay}>
             <Text style={styles.mapLocationText}>📍 Calle 10 # 5-24, Bogotá</Text>
          </View>
        </View>

      </ScrollView>

      {/* Footer Navegación */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}><Text style={styles.footerIconActive}>🏠</Text><Text style={styles.footerTextActive}>Inicio</Text></TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}><Text style={styles.footerIcon}>💊</Text><Text style={styles.footerText}>Medicamento</Text></TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}><Text style={styles.footerIcon}>📅</Text><Text style={styles.footerText}>Agendar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}><Text style={styles.footerIcon}>👤</Text><Text style={styles.footerText}>Perfil</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { backgroundColor: '#2185d0', paddingTop: 50, paddingBottom: 15, alignItems: 'center' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
  scrollContent: { padding: 20 },
  profileSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  label: { color: '#AAA', fontSize: 14 },
  mainName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  mainAvatar: { width: 50, height: 50, borderRadius: 25 },
  calendarStrip: { alignItems: 'center', marginBottom: 20 },
  monthText: { fontSize: 18, fontWeight: 'bold', color: '#444' },
  subText: { color: '#AAA', fontSize: 12 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  dayItem: { alignItems: 'center' },
  dayNum: { color: '#AAA', fontSize: 14 },
  dayName: { color: '#AAA', fontSize: 12, fontWeight: '500' },
  activeDayText: { color: '#2185d0', fontWeight: 'bold' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#2185d0', marginTop: 4 },
  timelineContainer: { marginBottom: 20 },
  timelineRow: { flexDirection: 'row' },
  leftLine: { alignItems: 'center', marginRight: 15 },
  node: { width: 14, height: 14, borderRadius: 7, zIndex: 1 },
  verticalLine: { width: 2, flex: 1, backgroundColor: '#EEE', marginVertical: -5 },
  eventCard: { 
    flex: 1, backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20,
    borderWidth: 1, borderColor: '#F0F0F0', elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  eventTitle: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  moreIcon: { color: '#CCC', fontSize: 18 },
  eventDetail: { color: '#666', fontSize: 13, marginVertical: 5 },
  timeRow: { backgroundColor: '#F8F9FA', padding: 5, borderRadius: 8, alignSelf: 'flex-start' },
  timeLabel: { fontSize: 12, color: '#666', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  mapCard: { borderRadius: 20, overflow: 'hidden', height: 150, backgroundColor: '#EEE', marginBottom: 30 },
  mapImage: { width: '100%', height: '100%' },
  mapOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 10 },
  mapLocationText: { fontSize: 11, fontWeight: 'bold', color: '#333' },
  footer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEE' },
  footerItem: { alignItems: 'center' },
  footerIcon: { fontSize: 20, color: '#AAA' },
  footerIconActive: { fontSize: 20, color: '#2185d0' },
  footerText: { fontSize: 10, color: '#AAA' },
  footerTextActive: { fontSize: 10, color: '#2185d0', fontWeight: 'bold' }
});