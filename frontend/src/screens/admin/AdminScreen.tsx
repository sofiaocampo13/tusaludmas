import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AdminScreen({ user }: any) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Superior */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TuSalud+</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Perfil del Admin */}
        <View style={styles.profileSection}>
          <Text style={styles.adminTitle}>{user.fullName}</Text>
          <Image 
            source={{ uri: 'https://via.placeholder.com/100' }} 
            style={styles.avatar} 
          />
        </View>

        {/* Selector de Tiempo */}
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Resumen General</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity style={styles.filterBtn}><Text style={styles.filterText}>Mensual</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.filterBtn, styles.activeFilter]}><Text style={styles.activeFilterText}>Semanal</Text></TouchableOpacity>
            <TouchableOpacity style={styles.filterBtn}><Text style={styles.filterText}>Hoy</Text></TouchableOpacity>
          </View>
        </View>

        {/* Cuadrícula de Estadísticas */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#3498DB' }]}>
            <Ionicons name="person" size={32} color="rgba(0,0,0,0.3)" />
            <Text style={styles.statLabel}>Usuarios activos hoy</Text>
            <Text style={styles.statValue}>1.240</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#1ABC9C' }]}>
            <Ionicons name="calendar" size={32} color="rgba(0,0,0,0.3)" />
            <Text style={styles.statLabel}>Citas registradas hoy</Text>
            <Text style={styles.statValue}>320</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#9B51E0' }]}>
            <MaterialCommunityIcons name="chat-processing" size={32} color="rgba(0,0,0,0.3)" />
            <Text style={styles.statLabel}>Recordatorios enviados</Text>
            <Text style={styles.statValue}>1.800</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E74C3C' }]}>
            <MaterialCommunityIcons name="alarm-light" size={32} color="rgba(0,0,0,0.3)" />
            <Text style={styles.statLabel}>Alarmas no respondidas</Text>
            <Text style={styles.statValue}>95</Text>
          </View>
        </View>

        {/* Botones de Gestión Naranjas */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>Gestionar Usuarios</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>Clinicas / Medicos</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>Medicamentos</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>Reportes</Text></TouchableOpacity>
        </View>
      </ScrollView>

      {/* Navegación Inferior */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem}><Ionicons name="stop" size={24} color="#333" /><Text style={styles.tabLabel}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}><Ionicons name="trending-up" size={24} color="#999" /><Text style={styles.tabLabel}>Analisis</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}><Ionicons name="clipboard-outline" size={24} color="#999" /><Text style={styles.tabLabel}>Stock</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}><Ionicons name="settings-outline" size={24} color="#999" /><Text style={styles.tabLabel}>Settings</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#3498DB', padding: 20, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  profileSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  adminTitle: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  summaryHeader: { marginBottom: 20 },
  summaryTitle: { fontSize: 22, fontWeight: 'bold', color: '#444', marginBottom: 15 },
  filterContainer: { flexDirection: 'row', backgroundColor: '#DDD', borderRadius: 10, padding: 4 },
  filterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeFilter: { backgroundColor: '#3498DB' },
  filterText: { color: '#666', fontWeight: 'bold' },
  activeFilterText: { color: '#FFF', fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: (width - 55) / 2, padding: 20, borderRadius: 20, marginBottom: 15, height: 180, justifyContent: 'space-between' },
  statLabel: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  statValue: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionBtn: { width: (width - 55) / 2, backgroundColor: '#E67E22', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  bottomTab: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#EEE', paddingVertical: 10, backgroundColor: '#FFF' },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 12, color: '#999', marginTop: 4 }
});