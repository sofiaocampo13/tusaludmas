import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';

export default function PacienteScreen({ route }) {
  const { user } = route.params || {};
  
  // AÑADE ESTA LÍNEA AQUÍ:
  console.log("DEBUG - Datos del usuario en pantalla:", JSON.stringify(user, null, 2));

  return (
    <View style={styles.container}>
      {/* Header Azul */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TUSALUD+</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Perfil y Código */}
        <View style={styles.profileSection}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?u=carlos' }} 
              style={styles.avatar} 
            />
            <View style={styles.textContainer}>
              <Text style={styles.greeting}>Buenos Días</Text>
              <Text style={styles.userName}>{user.fullName || user.username}</Text>
            </View>
          </View>
          <View style={styles.codeContainer}>
             <Text style={styles.codeLabel}>Tu código:</Text>
             <Text style={styles.codeNumber}>{user.link_code}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>IMPORTANTES</Text>
        
        {/* Filtros horizontales */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <TouchableOpacity style={[styles.filterBtn, styles.filterActive]}>
            <Text style={styles.filterTextActive}>TODO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>CARDIOLOGÍA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>ORTOPEDIA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>NEUROLOGÍA</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Tarjeta de Cita Médica (Azul) */}
        <View style={[styles.card, { backgroundColor: '#2185d0' }]}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>Dr. Sarah Johnson</Text>
             <Text style={styles.cardSub}>Cardiología - Consulta</Text>
          </View>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>📅 Jue, 13 Mar 2025  🕒 10:30-11:30</Text>
          </View>
        </View>

        {/* Tarjeta de Medicamento (Morada) */}
        <View style={[styles.card, { backgroundColor: '#a333c8' }]}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>Atorvastatina</Text>
             <Text style={styles.cardSub}>Dosis: 10-40 mg/día - Colesterol</Text>
          </View>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>🕒 1:00 PM</Text>
          </View>
        </View>

        {/* Tarjeta de Cita Médica (Rosa) */}
        <View style={[styles.card, { backgroundColor: '#f2711c' }]}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>Dr. Angie Lobos</Text>
             <Text style={styles.cardSub}>Ortopedia - Consulta</Text>
          </View>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>📅 Lun, 17 Mar 2025  🕒 09:00 AM</Text>
          </View>
        </View>
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={styles.bottomNav}>
          <Text style={styles.navItem}>🏠 Inicio</Text>
          <Text style={styles.navItem}>📅 Citas</Text>
          <Text style={styles.navItem}>⚙️ Ajustes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#2185d0', padding: 15, paddingTop: 45 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  scrollContent: { paddingBottom: 30 },
  profileSection: { 
    flexDirection: 'row', 
    padding: 20, 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 55, height: 55, borderRadius: 28, marginRight: 12 },
  textContainer: { justifyContent: 'center' },
  greeting: { color: '#888', fontSize: 14 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  codeContainer: { alignItems: 'flex-end' },
  codeLabel: { fontSize: 12, color: '#888' },
  codeNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  sectionTitle: { paddingHorizontal: 20, fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 10 },
  filtersContainer: { paddingLeft: 20, marginVertical: 15, flexDirection: 'row' },
  filterBtn: { 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#f0f0f0', 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  filterActive: { backgroundColor: '#2185d0', borderColor: '#2185d0' },
  filterTextActive: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  filterText: { color: '#666', fontSize: 12, fontWeight: '600' },
  card: { 
    marginHorizontal: 20, 
    marginBottom: 15, 
    padding: 20, 
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardHeader: { marginBottom: 15 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
  timeBadge: { 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    padding: 10, 
    borderRadius: 12, 
    alignSelf: 'flex-start' 
  },
  timeText: { color: 'white', fontSize: 13, fontWeight: '600' },
  bottomNav: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 15, 
    borderTopWidth: 1, 
    borderColor: '#eee', 
    backgroundColor: '#fff' 
  },
  navItem: { fontSize: 12, color: '#666' }
});