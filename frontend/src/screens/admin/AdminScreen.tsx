import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminScreen({ user }: any) {
  const router = useRouter();
  
  // ESTADOS PARA LA LÓGICA DINÁMICA
  const [filter, setFilter] = useState<'Mensual' | 'Semanal' | 'Hoy'>('Semanal');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    activeUsers: '1.240',
    appointments: '320',
    reminders: '1.800',
    alarms: '95'
  });

  // Función para simular el cambio de datos según el filtro
  // En el futuro, aquí llamarás a tu getAllStatsProvider(filter)
  const handleFilterChange = (selectedFilter: 'Mensual' | 'Semanal' | 'Hoy') => {
    setFilter(selectedFilter);
    setLoading(true);

    // Simulamos una pequeña carga de red
    setTimeout(() => {
      if (selectedFilter === 'Hoy') {
        setStats({ activeUsers: '45', appointments: '12', reminders: '85', alarms: '3' });
      } else if (selectedFilter === 'Semanal') {
        setStats({ activeUsers: '310', appointments: '98', reminders: '420', alarms: '15' });
      } else {
        setStats({ activeUsers: '1.240', appointments: '320', reminders: '1.800', alarms: '95' });
      }
      setLoading(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandText}>TuSalud+</Text>
          <Text style={styles.adminRole}>Superadministrador</Text>
          <Text style={styles.adminName}>{user?.fullName || 'Admin'}</Text>
        </View>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/150?u=admin' }} 
          style={styles.avatar} 
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Resumen General con Filtros Funcionales */}
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Resumen General</Text>
          <View style={styles.filterContainer}>
            {(['Mensual', 'Semanal', 'Hoy'] as const).map((item) => (
              <TouchableOpacity 
                key={item}
                style={[styles.filterBtn, filter === item && styles.activeFilter]}
                onPress={() => handleFilterChange(item)}
              >
                <Text style={filter === item ? styles.activeFilterText : styles.filterText}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cuadrícula de Estadísticas Dinámicas */}
        {loading ? (
          <View style={{ height: 240, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#3498DB" />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#3498DB' }]}>
              <Ionicons name="people" size={24} color="white" />
              <Text style={styles.statLabel}>Usuarios activos</Text>
              <Text style={styles.statValue}>{stats.activeUsers}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#1ABC9C' }]}>
              <Ionicons name="calendar" size={24} color="white" />
              <Text style={styles.statLabel}>Citas {filter.toLowerCase()}</Text>
              <Text style={styles.statValue}>{stats.appointments}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#9B51E0' }]}>
              <MaterialCommunityIcons name="chat-processing" size={24} color="white" />
              <Text style={styles.statLabel}>Recordatorios</Text>
              <Text style={styles.statValue}>{stats.reminders}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#E74C3C' }]}>
              <MaterialCommunityIcons name="alarm-light" size={24} color="white" />
              <Text style={styles.statLabel}>Alarmas</Text>
              <Text style={styles.statValue}>{stats.alarms}</Text>
            </View>
          </View>
        )}

        {/* Botones de Gestión */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/admin/users')}>
            <Text style={styles.actionBtnText}>Gestionar Usuarios</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/admin/medicines')}>
            <Text style={styles.actionBtnText}>Medicamentos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/admin/reports')}>
            <Text style={styles.actionBtnText}>Reportes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  brandText: { color: '#3498DB', fontSize: 16, fontWeight: 'bold' },
  adminRole: { color: '#666', fontSize: 12 },
  adminName: { fontSize: 18, fontWeight: 'bold' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#EEE' },
  scrollContent: { padding: 20 },
  summaryHeader: { marginBottom: 20 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  filterContainer: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 8, padding: 3 },
  filterBtn: { flex: 1, paddingVertical: 6, alignItems: 'center' },
  activeFilter: { backgroundColor: '#3498DB', borderRadius: 6 },
  filterText: { fontSize: 12, color: '#888' },
  activeFilterText: { fontSize: 12, color: '#FFF', fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', height: 110, padding: 15, borderRadius: 15, marginBottom: 15, justifyContent: 'space-between' },
  statLabel: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  statValue: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  actionBtn: { width: '48%', backgroundColor: '#F39C12', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});