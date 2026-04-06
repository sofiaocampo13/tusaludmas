import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import type { PatientLinked } from '../../types/database';
import { createPatientAppointment, getCaregiverPatients, getClinics, listPatientAppointments } from '../../services/dataService';

type Clinic = { id: number; name: string; address: string };
type Props = { caregiverId?: number };

const AgendarScreen: React.FC<Props> = ({ caregiverId }) => {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientLinked | null>(null);
  const [cita, setCita] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Clínicas
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);

  // Fecha y hora separadas
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'fecha' | 'hora' | null>(null);

  const patientName = useMemo(() => {
    if (!patient) return 'Paciente';
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || String(patient.id);
  }, [patient]);

  const selectedClinic = useMemo(
    () => clinics.find(c => c.id === selectedClinicId) ?? null,
    [clinics, selectedClinicId]
  );

  const formatDateTime = () => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = fecha.getFullYear();
    const m = pad(fecha.getMonth() + 1);
    const d = pad(fecha.getDate());
    const h = pad(hora.getHours());
    const min = pad(hora.getMinutes());
    return `${y}-${m}-${d} ${h}:${min}:00`;
  };

  const reload = async (patientId: number) => {
    const res = await listPatientAppointments(patientId);
    setAppointments(res.appointments || []);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!caregiverId) return;
      try {
        const [patientsRes, clinicsRes] = await Promise.all([
          getCaregiverPatients(caregiverId),
          getClinics(),
        ]);

        if (!mounted) return;

        const p = patientsRes.patients?.[0] ?? null;
        setPatient(p);
        if (p) await reload(p.id);

        const list = clinicsRes.clinics ?? [];
        setClinics(list);
        if (list.length > 0) setSelectedClinicId(list[0].id);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'No se pudo cargar');
      }
    })();
    return () => { mounted = false; };
  }, [caregiverId]);

  const handleCrear = async () => {
    if (!patient) return Alert.alert('Error', 'No hay paciente vinculado');

    setLoading(true);
    try {
      const apptDatetime = formatDateTime();
      await createPatientAppointment(patient.id, {
        appointment_datetime: apptDatetime,
        description: cita.trim() || null,
        status: 'confirmada',
        location_name: selectedClinic?.name ?? null,
        location_address: selectedClinic?.address ?? null,
        alarm_datetime: apptDatetime,
        alarm_title: 'Cita',
      });
      await reload(patient.id);
      setCita('');
      Alert.alert('Listo', 'Cita creada');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo crear la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.navigate('/cuidador')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color="#004080" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Cita</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.patientLabel}>Paciente: {patientName}</Text>

        <Text style={styles.label}>Descripción de la cita</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Consulta de control"
          value={cita}
          onChangeText={setCita}
        />

        <Text style={styles.label}>Clínica / Lugar</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={selectedClinicId}
            onValueChange={(v) => setSelectedClinicId(v)}
          >
            {clinics.length === 0 && (
              <Picker.Item label="Cargando clínicas..." value={null} />
            )}
            {clinics.map(c => (
              <Picker.Item key={c.id} label={c.name} value={c.id} />
            ))}
          </Picker>
        </View>
        {selectedClinic?.address ? (
          <Text style={styles.clinicAddress}>{selectedClinic.address}</Text>
        ) : null}

        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker('fecha')}>
          <Ionicons name="calendar-outline" size={20} color="#004080" />
          <Text style={styles.dateBtnText}>
            {fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Hora</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker('hora')}>
          <Ionicons name="time-outline" size={20} color="#004080" />
          <Text style={styles.dateBtnText}>
            {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={showPicker === 'fecha' ? fecha : hora}
            mode={showPicker === 'fecha' ? 'date' : 'time'}
            is24Hour
            onChange={(e, d) => {
              setShowPicker(null);
              if (!d) return;
              if (showPicker === 'fecha') setFecha(d);
              else setHora(d);
            }}
          />
        )}

        <TouchableOpacity
          style={styles.createBtn}
          onPress={handleCrear}
          disabled={loading}
        >
          <Text style={styles.createBtnText}>
            {loading ? 'Creando...' : 'Crear cita'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Citas programadas</Text>
        {appointments.map((a) => (
          <View key={a.id} style={styles.item}>
            <Text style={styles.itemTitle}>{a.description || 'Cita'}</Text>
            <Text style={styles.itemMeta}>
              {(a.location_name || '').trim() ? `${a.location_name} • ` : ''}
              {a.appointment_datetime}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AgendarScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 20 },
  patientLabel: { marginBottom: 10, color: '#004080', fontWeight: 'bold', fontSize: 15 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 16, color: '#333' },
  input: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, fontSize: 16, color: '#000', borderWidth: 1, borderColor: '#E9ECEF' },
  pickerBox: { backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF', overflow: 'hidden' },
  clinicAddress: { color: '#888', fontSize: 12, marginTop: 4, marginLeft: 4 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#E9ECEF', gap: 10 },
  dateBtnText: { fontSize: 16, color: '#333' },
  createBtn: { backgroundColor: '#004080', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 24 },
  createBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { marginTop: 30, marginBottom: 10, fontSize: 16, fontWeight: 'bold', color: '#333' },
  item: { padding: 12, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', marginBottom: 10 },
  itemTitle: { fontWeight: 'bold', color: '#333' },
  itemMeta: { color: '#666', marginTop: 4, fontSize: 12 },
});
