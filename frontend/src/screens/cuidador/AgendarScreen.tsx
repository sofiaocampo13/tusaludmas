import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { PatientLinked } from '../../types/database';
import { createPatientAppointment, getCaregiverPatients, listPatientAppointments } from '../../services/dataService';

type Props = { caregiverId?: number };

const AgendarScreen: React.FC<Props> = ({ caregiverId }) => {
  const [patient, setPatient] = useState<PatientLinked | null>(null);
  const [cita, setCita] = useState('');
  const [lugar, setLugar] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pickerValue, setPickerValue] = useState<Date>(new Date());

  const patientName = useMemo(() => {
    if (!patient) return 'Paciente';
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || String(patient.id);
  }, [patient]);

  const reload = async (patientId: number) => {
    const res = await listPatientAppointments(patientId);
    setAppointments(res.appointments || []);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!caregiverId) return;
      try {
        const res = await getCaregiverPatients(caregiverId);
        const p = res.patients?.[0] || null;
        if (!mounted) return;
        setPatient(p);
        if (p) await reload(p.id);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'No se pudo cargar el paciente');
      }
    })();
    return () => {
      mounted = false;
      // Limpieza de seguridad para evitar que el picker intente referenciar una pantalla cerrada
      if (Platform.OS === 'android') {
        DateTimePickerAndroid.dismiss('date');
      }
    };
  }, [caregiverId]);

  // Manejador de cambio: Formatea la fecha y la guarda
  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') return;

    const d = date || pickerValue;
    setPickerValue(d);

    const pad = (n: number) => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const h = pad(d.getHours());
    const min = pad(d.getMinutes());
    
    setFechaHora(`${y}-${m}-${day} ${h}:${min}:00`);
  };

  // Abre el picker usando la API nativa de Android
  const openPicker = () => {
    DateTimePickerAndroid.open({
      value: pickerValue,
      onChange: onPickerChange,
      mode: 'date', // Puedes cambiar a 'time' si ya tienes la fecha
      is24Hour: true,
    });
  };

  const handleCrear = async () => {
    if (!patient) return Alert.alert('Error', 'No hay paciente vinculado');
    if (!fechaHora.trim()) return Alert.alert('Falta información', 'Ingresa fecha/hora');
    
    setLoading(true);
    try {
      await createPatientAppointment(patient.id, {
        appointment_datetime: fechaHora.trim(),
        description: cita.trim() || null,
        status: 'confirmada',
        location_name: lugar.trim() || null,
        location_address: null,
        alarm_datetime: fechaHora.trim(),
        alarm_title: 'Cita',
      });
      await reload(patient.id);
      setCita('');
      setLugar('');
      setFechaHora('');
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
        <Ionicons name="chevron-back" size={24} color="#333" />
        <Text style={styles.headerTitle}>Agendar Cita</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.patientLabel}>Paciente: {patientName}</Text>

        <Text style={styles.label}>Cita</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Descripción" 
          value={cita} 
          onChangeText={setCita} 
        />

        <Text style={styles.label}>Lugar</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Lugar" 
          value={lugar} 
          onChangeText={setLugar} 
        />

        <Text style={styles.label}>Fecha/Hora</Text>
        <TouchableOpacity onPress={openPicker} activeOpacity={0.7}>
          <View pointerEvents="none">
            <TextInput
              style={styles.input}
              placeholder="Presiona para seleccionar"
              value={fechaHora}
              editable={false}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.createBtn} 
          onPress={handleCrear} 
          disabled={loading}
        >
          <Text style={styles.createBtnText}>
            {loading ? 'Creando...' : 'Crear'}
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
  patientLabel: { marginBottom: 10, color: '#666' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#F0F0F0', borderRadius: 12, padding: 15, marginBottom: 20, fontSize: 16, color: '#000' },
  createBtn: { backgroundColor: '#2196F3', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  createBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { marginTop: 25, marginBottom: 10, fontSize: 16, fontWeight: 'bold', color: '#333' },
  item: { padding: 12, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', marginBottom: 10 },
  itemTitle: { fontWeight: 'bold', color: '#333' },
  itemMeta: { color: '#666', marginTop: 4, fontSize: 12 },
});