import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { PatientLinked, User } from '../../types/database';
import { getCaregiverPatients, getUserById } from '../../services/dataService';

type Props = { caregiverId?: number };

const PerfilScreen: React.FC<Props> = ({ caregiverId }) => {
  const [caregiver, setCaregiver] = useState<User | null>(null);
  const [patient, setPatient] = useState<PatientLinked | null>(null);
  const [notas, setNotas] = useState('');

  const caregiverName = useMemo(() => {
    if (!caregiver) return 'Cuidador';
    return `${caregiver.first_name || ''} ${caregiver.last_name || ''}`.trim() || caregiver.username;
  }, [caregiver]);

  const patientName = useMemo(() => {
    if (!patient) return '';
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || String(patient.id);
  }, [patient]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!caregiverId) return;
      try {
        const [uRes, pRes] = await Promise.all([
          getUserById(caregiverId),
          getCaregiverPatients(caregiverId),
        ]);
        if (!mounted) return;
        setCaregiver(uRes.user);
        setPatient(pRes.patients?.[0] || null);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'No se pudo cargar el perfil');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [caregiverId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>Cuidador</Text>
            </View>
            <Text style={styles.name}>{caregiverName}</Text>
            <Text style={styles.email}>{caregiver?.email || ''}</Text>
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerBtn}>
            <Text style={styles.dangerBtnText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Datos del Paciente</Text>

        <Text style={styles.label}>Nombre Paciente</Text>
        <TextInput style={styles.input} editable={false} value={patientName} placeholder="Nombre" />

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput style={styles.input} editable={false} value={caregiver?.phone || ''} placeholder="Teléfono" />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Código de Vinculación</Text>
            <TextInput style={styles.input} editable={false} value={caregiver?.link_code || ''} placeholder="Código" />
          </View>
        </View>

        <Text style={styles.label}>Notas</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notas"
          value={notas}
          onChangeText={setNotas}
          multiline
          numberOfLines={4}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PerfilScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { padding: 20 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', borderRadius: 16, padding: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.6)', marginRight: 14 },
  rolePill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 6 },
  rolePillText: { fontSize: 12, fontWeight: 'bold', color: '#004282' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  email: { marginTop: 2, fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  buttonsRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  secondaryBtn: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', paddingVertical: 10, borderRadius: 18, alignItems: 'center' },
  secondaryBtnText: { color: '#333', fontWeight: 'bold' },
  dangerBtn: { flex: 1, backgroundColor: '#FF5A5A', paddingVertical: 10, borderRadius: 18, alignItems: 'center' },
  dangerBtnText: { color: '#FFF', fontWeight: 'bold' },
  sectionTitle: { marginTop: 18, marginBottom: 10, fontSize: 16, fontWeight: 'bold', color: '#333' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#F0F0F0', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 15 },
  textArea: { height: 90, textAlignVertical: 'top' },
  row2: { flexDirection: 'row' },
});

