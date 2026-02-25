import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function AdminScreen({ route }) {
  const { user } = route.params || { user: { username: 'Admin' } };

  return (
    <View style={styles.container}>
      {/* Header Estilo TuSalud+ */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TuSalud+</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Perfil del Administrador */}
        <View style={styles.profileRow}>
          <Text style={styles.adminName}>Superadministrador</Text>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?u=admin' }} 
            style={styles.avatar} 
          />
        </View>

        {/* Selector de periodo (Mensual, Semanal, Hoy) */}
        <View style={styles.tabContainer}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <View style={styles.tabs}>
            <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Mensual</Text></TouchableOpacity>
            <TouchableOpacity style={styles.tabActive}><Text style={styles.tabTextActive}>Semanal</Text></TouchableOpacity>
            <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Hoy</Text></TouchableOpacity>
          </View>
        </View>

        {/* Grid de Métricas (Colores del Mockup) */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#2185d0' }]}>
            <Text style={styles.statIcon}>👤</Text>
            <Text style={styles.statLabel}>Usuarios activos hoy</Text>
            <Text style={styles.statValue}>1.240</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#00b5ad' }]}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statLabel}>Citas registradas hoy</Text>
            <Text style={styles.statValue}>320</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#a333c8' }]}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statLabel}>Recordatorios enviados</Text>
            <Text style={styles.statValue}>1.800</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#db2828' }]}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={styles.statLabel}>Alarmas no respondidas</Text>
            <Text style={styles.statValue}>95</Text>
          </View>
        </View>

        {/* Botones de Gestión (Naranja Estilo Mockup) */}
        <View style={styles.managementGrid}>
          <TouchableOpacity style={styles.manageBtn}>
            <Text style={styles.manageBtnText}>Gestionar Usuarios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manageBtn}>
            <Text style={styles.manageBtnText}>Clinicas / Medicos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manageBtn}>
            <Text style={styles.manageBtnText}>Medicamentos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manageBtn}>
            <Text style={styles.manageBtnText}>Reportes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior de Administrador */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🔳</Text>
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📈</Text>
          <Text style={styles.navLabel}>Analisis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#2185d0', paddingTop: 50, paddingBottom: 15, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  adminName: { fontSize: 22, fontWeight: '600', color: '#333' },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#FFF' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#444' },
  tabs: { flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 8, padding: 2 },
  tab: { paddingHorizontal: 10, paddingVertical: 5 },
  tabActive: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#bbdefb', borderRadius: 6 },
  tabText: { fontSize: 11, color: '#666' },
  tabTextActive: { fontSize: 11, color: '#2185d0', fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', borderRadius: 15, padding: 15, marginBottom: 15, height: 160, elevation: 5 },
  statIcon: { fontSize: 24, color: 'white', marginBottom: 10 },
  statLabel: { color: 'white', fontSize: 13, opacity: 0.9, marginBottom: 5 },
  statValue: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  managementGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  manageBtn: { width: '48%', backgroundColor: '#f2711c', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  manageBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#DDD' },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 20, color: '#AAA' },
  navIconActive: { fontSize: 20, color: '#333' },
  navLabel: { fontSize: 10, color: '#AAA' },
  navLabelActive: { fontSize: 10, color: '#333', fontWeight: 'bold' }
});