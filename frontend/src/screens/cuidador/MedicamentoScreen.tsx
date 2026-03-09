import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { Medicine, PatientLinked } from '../../types/database';
import { createMedicineCatalog, createPatientMedicine, getCaregiverPatients, listMedicinesCatalog, listPatientMedicines } from '../../services/dataService';

type Props = { caregiverId?: number };

const MedicamentoScreen: React.FC<Props> = ({ caregiverId }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [dosis, setDosis] = useState('');
  const [frecuencia, setFrecuencia] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PatientLinked | null>(null);
  const [catalog, setCatalog] = useState<Medicine[]>([]);
  const [filteredCatalog, setFilteredCatalog] = useState<Medicine[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'inicio' | 'fin' | null>(null);
  const [horarios, setHorarios] = useState<string[]>(['06:00']);
  const [nuevoHorario, setNuevoHorario] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- LÓGICA DE CALENDARIO (RESTAURADA) ---
  const diasSemana = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const days = [];
    const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({ 
        num: date.getDate().toString(), 
        label: dayLabels[i], 
        isToday: date.toDateString() === today.toDateString() 
      });
    }
    return days;
  }, []);

  const patientName = useMemo(() => {
    if (!patient) return 'Cargando...';
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
  }, [patient]);

  const isValidTime = (time: string): boolean => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);

  const reload = async (patientId: number) => {
    const [catRes, pmRes] = await Promise.all([listMedicinesCatalog(), listPatientMedicines(patientId)]);
    setCatalog(catRes.medicines || []);
    setAssigned(pmRes.patient_medicines || []);
  };

  useEffect(() => {
    if (caregiverId) {
      getCaregiverPatients(caregiverId).then(res => {
        const p = res.patients?.[0] || null;
        setPatient(p);
        reload(p ? p.id : caregiverId);
      });
    }
  }, [caregiverId]);

  const handleNombreChange = (text: string) => {
    setNombre(text);
    if (text.trim().length > 0) {
      const filtered = catalog.filter(m => m.name.toLowerCase().includes(text.toLowerCase()));
      setFilteredCatalog(filtered);
      setShowSuggestions(true);
    } else setShowSuggestions(false);
  };

  const selectMedicine = (item: Medicine) => {
    setNombre(item.name);
    setDescripcion(item.description || '');
    setShowSuggestions(false);
  };

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    setPickerVisible(false);
    if (event.type === 'dismissed' || !date) return;
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (pickerTarget === 'inicio') setFechaInicio(formatted);
    else if (pickerTarget === 'fin') setFechaFin(formatted);
  };

  const handleCrear = async () => {
    const targetId = patient?.id || caregiverId;
    if (!targetId || !nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    setLoading(true);
    try {
      const existing = catalog.find(m => m.name.toLowerCase() === nombre.trim().toLowerCase());
      let mId = existing?.id;
      if (!mId) {
        const created = await createMedicineCatalog({ name: nombre.trim(), description: descripcion.trim() || null });
        mId = created.id;
      }
      const alarmTime = (fechaInicio && horarios.length > 0) ? `${fechaInicio} ${horarios[0]}:00` : null;
      await createPatientMedicine(targetId, {
        medicine_id: mId!,
        dose: dosis.trim(),
        frequency: `Horas: ${horarios.join(', ')}`,
        start_date: fechaInicio || null,
        end_date: fechaFin || null,
        alarm_datetime: alarmTime,
        alarm_title: `Toma: ${nombre}`,
      });
      await reload(targetId);
      setNombre(''); setDescripcion(''); setDosis('');
      Alert.alert('Éxito', 'Medicamento registrado');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}><Ionicons name="chevron-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Medicamento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* INFO PACIENTE (RESTAURADA) */}
        <Text style={styles.patientLabel}>Paciente: {patientName}</Text>

        {/* CALENDAR STRIP (RESTAURADA) */}
        <View style={styles.calendarStrip}>
          {diasSemana.map((item, index) => (
            <View key={index} style={[styles.dayItem, item.isToday && styles.dayActive]}>
              <Text style={[styles.dayText, item.isToday && styles.dayTextActive]}>{item.num}</Text>
              <Text style={[styles.dayLabel, item.isToday && styles.dayTextActive]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.label}>Nombre Medicamento</Text>
        <View style={{ zIndex: 100 }}>
          <TextInput style={styles.input} value={nombre} onChangeText={handleNombreChange} placeholder="Nombre" />
          {showSuggestions && filteredCatalog.length > 0 && (
            <View style={styles.suggestions}>
              {filteredCatalog.map(item => (
                <TouchableOpacity key={item.id} style={styles.suggestionItem} onPress={() => selectMedicine(item)}>
                  <Text style={{ fontSize: 16 }}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.label}>Descripción</Text>
        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline value={descripcion} onChangeText={setDescripcion} placeholder="Descripción" />

        <Text style={styles.label}>Dosis</Text>
        <TextInput style={styles.input} value={dosis} onChangeText={setDosis} placeholder="Ej: 10mg" />

        <Text style={styles.label}>Frecuencia</Text>
        <TextInput style={styles.input} value={frecuencia} onChangeText={setFrecuencia} placeholder="Ej: 1 vez al día" />

        <Text style={styles.label}>Fechas del Tratamiento</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={[styles.input, { width: '48%' }]} onPress={() => { setPickerTarget('inicio'); setPickerVisible(true); }}>
            <Text>{fechaInicio || 'Fecha Inicio'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.input, { width: '48%' }]} onPress={() => { setPickerTarget('fin'); setPickerVisible(true); }}>
            <Text>{fechaFin || 'Fecha Fin'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Horario</Text>
        <View style={{ flexDirection: 'row', marginBottom: 15, alignItems: 'center' }}>
          <TextInput 
            style={[styles.input, { flex: 1, marginBottom: 0 }]} 
            placeholder="Ej: 6:00, 8:30" 
            value={nuevoHorario} 
            onChangeText={setNuevoHorario}
          />
          <TouchableOpacity style={styles.addBtn} onPress={() => {
            if (isValidTime(nuevoHorario)) {
              setHorarios([...new Set([...horarios, nuevoHorario])].sort());
              setNuevoHorario('');
            } else Alert.alert('Error', 'Formato HH:MM');
          }}>
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {horarios.map(h => (
            <View key={h} style={styles.chip}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{h}</Text>
              <TouchableOpacity onPress={() => setHorarios(horarios.filter(x => x !== h))}>
                <Ionicons name="close-circle" size={18} color="#FFF" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={handleCrear} disabled={loading}>
          <Text style={styles.createBtnText}>{loading ? 'Cargando...' : 'Crear'}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Medicamentos asignados</Text>
        {assigned.map(pm => (
          <View key={pm.id} style={styles.assignedItem}>
            <Text style={styles.assignedName}>{pm.medicine_name}</Text>
            <Text style={styles.assignedMeta}>{pm.dose} • {pm.frequency}</Text>
          </View>
        ))}

        {pickerVisible && <DateTimePicker value={new Date()} mode="date" display="default" onChange={onPickerChange} />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#EEE' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  patientLabel: { marginBottom: 10, color: '#666', fontSize: 16 },
  calendarStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  dayItem: { alignItems: 'center', padding: 10, borderRadius: 10 },
  dayActive: { backgroundColor: '#2196F3' },
  dayText: { fontSize: 16, color: '#999' },
  dayLabel: { fontSize: 12, color: '#999' },
  dayTextActive: { color: '#FFF', fontWeight: 'bold' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#F0F0F0', borderRadius: 12, padding: 15, marginBottom: 20, fontSize: 16, justifyContent: 'center' },
  suggestions: { position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: '#FFF', borderRadius: 12, elevation: 5, zIndex: 1000, borderWidth: 1, borderColor: '#EEE' },
  suggestionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  addBtn: { backgroundColor: '#2196F3', padding: 10, borderRadius: 30, marginLeft: 10, height: 50, width: 50, alignItems: 'center', justifyContent: 'center' },
  chip: { backgroundColor: '#2196F3', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  createBtn: { backgroundColor: '#2196F3', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  createBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  assignedItem: { padding: 15, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  assignedName: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  assignedMeta: { fontSize: 12, color: '#666', marginTop: 4 }
});

export default MedicamentoScreen;