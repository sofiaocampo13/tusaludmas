import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

// Definimos que el componente recibe 'user' como prop directamente
export default function PacienteScreen({ user }: any) {
  
  // Si por alguna razón 'user' no llega, usamos valores por defecto para evitar errores
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
          <Image 
            source={{ uri: 'https://via.placeholder.com/100' }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Buenos Días</Text>
            {/* Mostramos el nombre que viene del login */}
            <Text style={styles.userName}>{displayUser.fullName}</Text>
          </View>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Tu código:</Text>
            {/* Mostramos el link_code de la base de datos */}
            <Text style={styles.codeValue}>{displayUser.link_code}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>IMPORTANTES</Text>
        
        {/* 2. Filtros de Categoría */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity style={[styles.chip, styles.activeChip]}>
            <Text style={styles.activeChipText}>TODO</Text>
          </TouchableOpacity>
          {['CARDIOLOGÍA', 'ORTOPEDIA', 'NEURO'].map((item) => (
            <TouchableOpacity key={item} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 3. Tarjetas de Citas y Medicamentos */}
        {/* Tarjeta Azul */}
        <View style={[styles.card, { backgroundColor: '#3498DB' }]}>
          <Text style={styles.cardDoctor}>Dr. Sarah Johnson</Text>
          <Text style={styles.cardSub}>Cardiología - Consulta</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Ionicons name="calendar" size={14} color="#FFF" />
              <Text style={styles.badgeText}>Jue, 13 Mar 2025</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="time" size={14} color="#FFF" />
              <Text style={styles.badgeText}>10:30-11:30</Text>
            </View>
          </View>
        </View>

        {/* Tarjeta Morada */}
        <View style={[styles.card, { backgroundColor: '#9B51E0' }]}>
          <Text style={styles.cardDoctor}>Atorvastatina</Text>
          <Text style={styles.cardSub}>Dosis: 10-40 mg/día - Colesterol</Text>
          <View style={styles.badge}>
            <Ionicons name="time" size={14} color="#FFF" />
            <Text style={styles.badgeText}>1:00 PM</Text>
          </View>
        </View>

        {/* Tarjeta Naranja */}
        <View style={[styles.card, { backgroundColor: '#F2994A' }]}>
          <Text style={styles.cardDoctor}>Dr. Angie Lobos</Text>
          <Text style={styles.cardSub}>Ortopedia - Consulta</Text>
          <View style={styles.badge}>
            <Ionicons name="calendar" size={14} color="#FFF" />
            <Text style={styles.badgeText}>Lun, 17 Mar 2025  09:00 AM</Text>
          </View>
        </View>
      </ScrollView>

      {/* 4. Barra de Navegación Inferior */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={24} color="#3498DB" />
          <Text style={[styles.tabText, { color: '#3498DB' }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="calendar-outline" size={24} color="#999" />
          <Text style={styles.tabText}>Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="settings-outline" size={24} color="#999" />
          <Text style={styles.tabText}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  blueHeader: {
    backgroundColor: '#3498DB',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  filterRow: { flexDirection: 'row', marginBottom: 20 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 10 },
  activeChip: { backgroundColor: '#3498DB' },
  chipText: { color: '#999', fontWeight: 'bold' },
  activeChipText: { color: '#FFF', fontWeight: 'bold' },

  card: { padding: 20, borderRadius: 20, marginBottom: 15 },
  cardDoctor: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  cardSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 15 },
  badgeContainer: { flexDirection: 'row', gap: 10 },
  badge: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  badgeText: { color: '#FFF', marginLeft: 5, fontSize: 12, fontWeight: 'bold' },

  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#EEE', paddingVertical: 10 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabText: { fontSize: 12, marginTop: 4, color: '#999' }
});