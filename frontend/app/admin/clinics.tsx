import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ClinicData,
  DoctorData,
  getClinicsAndDoctorsProvider,
} from '../../src/services/adminService';

export default function ClinicsDoctorsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'clinics' | 'doctors'>('clinics');
  const [clinics, setClinics] = useState<ClinicData[]>([]);
  const [doctors, setDoctors] = useState<DoctorData[]>([]);

  const loadData = async () => {
    setLoading(true);
    const result = await getClinicsAndDoctorsProvider();

    if (!result.success) {
      Alert.alert('Error', result.message || 'No se pudo cargar la información');
      setLoading(false);
      return;
    }

    setClinics(result.clinics || []);
    setDoctors(result.doctors || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clínicas y Médicos</Text>
        <TouchableOpacity onPress={loadData}>
          <Ionicons name="refresh" size={22} color="#004080" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'clinics' && styles.tabButtonActive]}
          onPress={() => setTab('clinics')}
        >
          <Text style={[styles.tabText, tab === 'clinics' && styles.tabTextActive]}>
            Clínicas ({clinics.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'doctors' && styles.tabButtonActive]}
          onPress={() => setTab('doctors')}
        >
          <Text style={[styles.tabText, tab === 'doctors' && styles.tabTextActive]}>
            Médicos ({doctors.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#004080" />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      ) : tab === 'clinics' ? (
        <FlatList
          data={clinics}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay clínicas registradas.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <Ionicons name="business-outline" size={20} color="#004080" />
              </View>
              <View style={styles.info}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.address || 'Sin dirección'}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay médicos registrados.</Text>}
          renderItem={({ item }) => {
            const fullName = `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email;
            const status = item.state === 1 ? 'Activo' : 'Suspendido';
            return (
              <View style={styles.card}>
                <View style={styles.iconBox}>
                  <Ionicons name="medkit-outline" size={20} color="#004080" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.title}>{fullName}</Text>
                  <Text style={styles.subtitle}>{item.email}</Text>
                  <Text style={styles.subtitle}>
                    Clínica: {item.clinica || 'No asignada'} | Estado: {status}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEE',
  },
  headerTitle: { fontSize: 19, fontWeight: 'bold', color: '#1C2833' },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: '#EAEFF5',
    borderRadius: 10,
    padding: 4,
  },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  tabButtonActive: { backgroundColor: '#004080' },
  tabText: { color: '#4D5B6A', fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#576574' },
  listContent: { padding: 14 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#E8F0FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: 'bold', color: '#1C2833' },
  subtitle: { fontSize: 13, color: '#667485', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#8A99A8' },
});
