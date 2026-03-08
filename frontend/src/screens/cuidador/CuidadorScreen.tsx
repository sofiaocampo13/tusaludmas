import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, Linking } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function CuidadorScreen({ user }: any) {
  // Daniel: Estados para la ubicación y datos del paciente
  const [pacienteInfo, setPacienteInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocation = async () => {
    try {
      // Daniel: Volvemos a la forma dinámica para que reconozca a cualquier cuidador
      const url = `http://192.168.1.28:3000/api/patients/location/${user.id}`;
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
                title={pacienteInfo.first_name}
                description="Ubicación actual del paciente"
              >
                <View style={styles.markerContainer}>
                  <Ionicons name="person-circle" size={40} color="#2196F3" />
                </View>
              </Marker>
            </MapView>
          ) : (
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
  mapContainer: { height: 250, borderRadius: 15, backgroundColor: '#E0E0E0', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  locationOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: '#FFF', padding: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  locationText: { marginLeft: 8, fontWeight: 'bold', color: '#004282' },
  bottomTab: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#EEE', paddingVertical: 10, backgroundColor: '#FFF' },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 10, color: '#999', marginTop: 4 },
  markerContainer: { backgroundColor: 'white', borderRadius: 20, padding: 2, elevation: 5 },
  noDataText: { color: '#666', fontStyle: 'italic' }
});
a