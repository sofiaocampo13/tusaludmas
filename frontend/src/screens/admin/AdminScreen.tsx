import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminScreen({ user }: any) {
  const router = useRouter();
  const [filter, setFilter] = useState<'Mensual' | 'Semanal' | 'Hoy'>('Semanal');
  const [loading, setLoading] = useState(false);
  const [activeBtn, setActiveBtn] = useState<string | null>(null);

  const [stats, setStats] = useState({
    activeUsers: '1.240',
    appointments: '320',
    reminders: '1.800',
    alarms: '95'
  });

  const handleFilterChange = (selectedFilter: 'Mensual' | 'Semanal' | 'Hoy') => {
    setFilter(selectedFilter);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const navigateTo = (path: string, btnName: string) => {
    setActiveBtn(btnName);
    setTimeout(() => {
      router.push(path as any);
      setActiveBtn(null); 
    }, 150);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 🟦 FRANJA AZUL SUPERIOR (Identidad Mockup) */}
      <View style={styles.blueBar}>
        <Text style={styles.blueBarText}>TuSalud+</Text>
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER CON FOTO Y AJUSTES */}
        <View style={styles.header}>
          <View>
            <Text style={styles.adminRole}>Superadministrador</Text>
            <Text style={styles.adminName}>{user?.fullName || 'admin'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/admin/settings' as any)} style={styles.settingsIcon}>
              <Ionicons name="settings-outline" size={26} color="#004080" />
            </TouchableOpacity>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?u=admin' }} 
              style={styles.avatar} 
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* RESUMEN GENERAL Y FILTROS */}
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumen General</Text>
            <View style={styles.filterContainer}>
              {(['Mensual', 'Semanal', 'Hoy'] as const).map((item) => (
                <TouchableOpacity 
                  key={item}
                  style={[styles.filterBtn, filter === item && styles.activeFilter]}
                  onPress={() => handleFilterChange(item)}
                >
                  <Text style={filter === item ? styles.activeFilterText : styles.filterText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ESTADÍSTICAS */}
          {loading ? (
            <ActivityIndicator size="large" color="#004080" style={{ marginVertical: 40 }} />
          ) : (
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#3498DB' }]}>
                <Ionicons name="people" size={24} color="white" />
                <Text style={styles.statLabel}>Usuarios activos hoy</Text>
                <Text style={styles.statValue}>{stats.activeUsers}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#1ABC9C' }]}>
                <Ionicons name="calendar" size={24} color="white" />
                <Text style={styles.statLabel}>Citas registradas hoy</Text>
                <Text style={styles.statValue}>{stats.appointments}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#9B51E0' }]}>
                <MaterialCommunityIcons name="chat-processing" size={24} color="white" />
                <Text style={styles.statLabel}>Recordatorios enviados</Text>
                <Text style={styles.statValue}>{stats.reminders}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#E74C3C' }]}>
                <MaterialCommunityIcons name="alarm-light" size={24} color="white" />
                <Text style={styles.statLabel}>Alarmas no respondidas</Text>
                <Text style={styles.statValue}>{stats.alarms}</Text>
              </View>
            </View>
          )}

          {/* GESTIÓN - BOTONES AZULES COMPACTOS */}
          <Text style={styles.summaryTitle}>Gestión</Text>
          <View style={styles.actionsGrid}>
            {[
              { id: 'users', label: 'Gestionar Usuarios', route: '/admin/users' },
              { id: 'clinics', label: 'Clínicas / Médicos', route: '/admin/clinics' },
              { id: 'meds', label: 'Medicamentos', route: '/admin/medicines' },
              { id: 'reports', label: 'Reportes', route: '/admin/reports' },
            ].map((btn) => (
              <TouchableOpacity 
                key={btn.id}
                style={[styles.actionBtn, activeBtn === btn.id && styles.actionBtnActive]} 
                onPress={() => navigateTo(btn.route, btn.id)}
              >
                <Text style={[styles.actionBtnText, activeBtn === btn.id && styles.actionBtnTextActive]}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  // 🟦 ESTILO DE LA FRANJA AZUL
  blueBar: { 
    backgroundColor: '#004080', 
    height: 60, 
    width: '100%', 
    justifyContent: 'center', 
    paddingHorizontal: 20,
    paddingTop: 10
  },
  blueBarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  settingsIcon: { marginRight: 15 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#EEE' },
  adminRole: { color: '#666', fontSize: 14 },
  adminName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  summaryHeader: { marginVertical: 15 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  filterContainer: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 10, padding: 4 },
  filterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  activeFilter: { backgroundColor: '#004080', borderRadius: 8 },
  filterText: { fontSize: 13, color: '#888' },
  activeFilterText: { fontSize: 13, color: '#FFF', fontWeight: 'bold' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', height: 120, padding: 15, borderRadius: 20, marginBottom: 15, justifyContent: 'space-between', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  statLabel: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionBtn: { 
    width: '48%', 
    backgroundColor: '#F5F7FA', 
    paddingVertical: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E1E4E8'
  },
  actionBtnActive: { backgroundColor: '#004080', borderColor: '#004080' },
  actionBtnText: { color: '#004080', fontWeight: 'bold', fontSize: 13 },
  actionBtnTextActive: { color: '#FFF' }
});