import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CuidadorScreen({ user }: any) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Estilo Mockup */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TUSALUD+</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bienvenida */}
        <View style={styles.welcomeSection}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/100' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.greeting}>Buenos Días</Text>
            <Text style={styles.userName}>{user.fullName}</Text>
          </View>
        </View>

        {/* Resumen Diario Carlos */}
        <View style={styles.summaryCard}>
          <Text style={styles.monthTitle}>Marzo</Text>
          <Text style={styles.subSubtitle}>1 toma confirmada hoy</Text>
          
          {/* Timeline de Actividades */}
          <View style={styles.timelineItem}>
            <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Toma Confirmada</Text>
              <Text style={styles.activityDetail}>Medicamento: Atorvastatina</Text>
              <Text style={styles.activityTime}><Ionicons name="time-outline" /> 1:00 PM</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.dot, { backgroundColor: '#2196F3' }]} />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Cita Confirmada</Text>
              <Text style={styles.activityDetail}>Cardiología</Text>
              <Text style={styles.activityTime}><Ionicons name="time-outline" /> 10:30 - 11:30</Text>
            </View>
          </View>
        </View>

        {/* Mapa de Ubicación (Placeholder visual del mockup) */}
        <Text style={styles.sectionLabel}>Ubicación de Carlos</Text>
        <View style={styles.mapContainer}>
          <Image 
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Google_Maps_icon_%282020%29.png' }} 
            style={styles.mapPlaceholder}
            resizeMode="contain"
          />
          <View style={styles.locationOverlay}>
            <Ionicons name="call" size={20} color="#004282" />
            <Text style={styles.locationText}>Llamar a Carlos</Text>
          </View>
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior - Idéntica al mockup */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { backgroundColor: '#2196F3', padding: 15, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  scrollContent: { padding: 20 },
  welcomeSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  greeting: { fontSize: 14, color: '#666' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  summaryCard: { backgroundColor: '#F8F9FA', borderRadius: 15, padding: 20, elevation: 2 },
  monthTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  subSubtitle: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 5, marginRight: 15 },
  activityInfo: { flex: 1, backgroundColor: '#FFF', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  activityTitle: { fontWeight: 'bold', fontSize: 14 },
  activityDetail: { color: '#666', fontSize: 12 },
  activityTime: { fontSize: 12, color: '#2196F3', marginTop: 5 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 10 },
  mapContainer: { height: 200, borderRadius: 15, backgroundColor: '#E0E0E0', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  mapPlaceholder: { width: '100%', height: '100%', opacity: 0.5 },
  locationOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: '#FFF', padding: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  locationText: { marginLeft: 8, fontWeight: 'bold', color: '#004282' },
  bottomTab: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#EEE', paddingVertical: 10, backgroundColor: '#FFF' },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 10, color: '#999', marginTop: 4 }
});