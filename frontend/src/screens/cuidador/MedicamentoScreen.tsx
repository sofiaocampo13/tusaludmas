import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import type { Medicine, PatientLinked } from '../../types/database';
import {
  getCaregiverPatients,
  createPatientMedicine,
  createAlarm,
  searchMedicines,
  listPatientMedicines // Añadido para listar los ya creados
} from '../../services/dataService';

type Toma = { id: string; hora: Date; activa: boolean; };

const MedicamentoScreen: React.FC<{ caregiverId: number }> = ({ caregiverId }) => {
  const [patient, setPatient] = useState<PatientLinked | null>(null);
  const [filteredCatalog, setFilteredCatalog] = useState<Medicine[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]); // Estado para medicamentos asignados
  const [nombreBusqueda, setNombreBusqueda] = useState('');
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [dosisValor, setDosisValor] = useState('');
  const [dosisUnidad, setDosisUnidad] = useState('mg');
  const [frecuenciaValor, setFrecuenciaValor] = useState('12');
  const [frecuenciaTipo, setFrecuenciaTipo] = useState('Horas');

  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date(new Date().setDate(new Date().getDate() + 7)));
  const [horaInicio, setHoraInicio] = useState(new Date());

  const [planTomas, setPlanTomas] = useState<Toma[]>([]);
  const [showPicker, setShowPicker] = useState<'inicio' | 'fin' | 'hora' | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [generarTodo, setGenerarTodo] = useState(true); // Nuevo estado: true = todo el tratamiento, false = solo 2 días

  // Función para recargar la lista de medicamentos asignados
  const reloadAssigned = async (patientId: number) => {
    try {
      const res = await listPatientMedicines(patientId);
      if (res.success) {
        setAssigned(res.patient_medicines || []);
      }
    } catch (e) {
      console.error("Error cargando asignados:", e);
    }
  };

  useEffect(() => {
    getCaregiverPatients(caregiverId).then(res => {
      if (res.success && res.patients.length > 0) {
        const p = res.patients[0];
        setPatient(p);
        reloadAssigned(p.id); // Cargar lista al entrar
      }
    });
  }, [caregiverId]);

  const validarDosis = (valor: string, unidad: string): boolean => {
    const num = parseFloat(valor);
    if (isNaN(num) || num <= 0) return false;
    const limites: Record<string, number> = {
      'mg': 2000, 'ml': 50, 'tabletas': 5, 'gotas': 60
    };
    if (num > limites[unidad]) {
      Alert.alert("Dosis Inusual", `Has ingresado ${num} ${unidad}. Verifica si es correcta.`);
      return false;
    }
    return true;
  };

  const handleBusqueda = async (text: string) => {
    setNombreBusqueda(text);
    if (text.trim().length > 2) {
      setLoadingSearch(true);
      try {
        const res: any = await searchMedicines(text);
        if (res && Array.isArray(res)) {
          setFilteredCatalog(res);
          setShowSuggestions(true);
        }
      } catch (e) {
        console.error("Error en búsqueda:", e);
      } finally {
        setLoadingSearch(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectMedicine = (item: Medicine) => {
    setSelectedMed(item);
    setNombreBusqueda(item.name);
    setShowSuggestions(false);
  };

  const calcularPizarra = (forzarTodo?: boolean) => {
    if (!validarDosis(dosisValor, dosisUnidad)) return;
    const fValor = parseInt(frecuenciaValor);
    if (isNaN(fValor) || fValor <= 0) return Alert.alert("Error", "Frecuencia no válida");

    const nuevas: Toma[] = [];

    // 1. NORMALIZACIÓN DE FECHAS
    // Seteamos la fecha de inicio con la hora exacta elegida
    let current = new Date(fechaInicio);
    current.setHours(horaInicio.getHours(), horaInicio.getMinutes(), 0, 0);

    // Seteamos la fecha fin al último segundo del día para no perder tomas
    const limiteFinal = new Date(fechaFin);
    limiteFinal.setHours(23, 59, 59, 999);

    // 2. DETERMINAMOS EL MODO Y LÍMITE VISUAL
    const modoTodo = forzarTodo !== undefined ? forzarTodo : generarTodo;

    // Si es "parte", el límite son 48 horas desde la primera toma.
    const fechaLimiteVisual = modoTodo
      ? limiteFinal
      : new Date(current.getTime() + 2 * 24 * 60 * 60 * 1000);

    // 3. EL BUCLE DE GENERACIÓN
    // Usamos una variable de seguridad para evitar bucles infinitos
    let seguridad = 0;
    while (current <= limiteFinal && current <= fechaLimiteVisual && seguridad < 500) {

      // Si es "solo una parte", limitamos a las primeras 3 tomas
      if (!modoTodo && nuevas.length >= 3) break;

      nuevas.push({
        id: Math.random().toString(36).substring(2, 9),
        // IMPORTANTE: Creamos una nueva instancia de fecha para que no se hereden cambios
        hora: new Date(current.getTime()),
        activa: true
      });

      // 4. INCREMENTO PRECISO
      if (frecuenciaTipo === 'Horas') {
        current.setHours(current.getHours() + fValor);
      } else {
        current.setDate(current.getDate() + fValor);
      }

      seguridad++;
    }

    setPlanTomas(nuevas);
  };

  const formatearFechaLocal = (date: Date) => {
  // Usamos Intl.DateTimeFormat para obtener las partes de la fecha en la zona horaria específica
  const opciones: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const formatter = new Intl.DateTimeFormat('en-CA', opciones); // 'en-CA' genera formato YYYY-MM-DD
  const partes = formatter.formatToParts(date);

  // Extraemos los valores de las partes para armar el string final
  const mapping = Object.fromEntries(partes.map(p => [p.type, p.value]));

  return `${mapping.year}-${mapping.month}-${mapping.day} ${mapping.hour}:${mapping.minute}:${mapping.second}`;
};

  const ejecutarGuardado = async () => {
    if (!patient || !selectedMed) return;
    setLoading(true);
    try {
      const resPM = await createPatientMedicine(patient.id, {
        medicine_id: selectedMed.id,
        dose: `${dosisValor} ${dosisUnidad}`,
        frequency: `Cada ${frecuenciaValor} ${frecuenciaTipo}`,
        start_date: fechaInicio.toISOString().split('T')[0],
        end_date: fechaFin.toISOString().split('T')[0]
      });

      if (resPM.success) {
        // Lógica de filtrado según la preferencia del usuario
        const tomasAProcesar = generarTodo
          ? planTomas
          : planTomas.slice(0, 5); // Por ejemplo, solo las primeras 5 si elige "una parte"

        for (const toma of tomasAProcesar) {
          const mysqlDateTime = formatearFechaLocal(toma.hora);
          await createAlarm({
            users_id: patient.id,
            patient_medicine_id: resPM.id,
            title: `Toma: ${selectedMed.name}`,
            alarm_datetime: mysqlDateTime,
            state: 0
          });
        }

        Alert.alert("Éxito", `Tratamiento creado con ${tomasAProcesar.length} alarmas.`);
        setPlanTomas([]);
        setNombreBusqueda('');
        reloadAssigned(patient.id);
      }
    } catch (e) {
      Alert.alert("Error", "Fallo al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}><Ionicons name="chevron-back" size={28} color="black" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Medicamento</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always">

          {patient && (
            <Text style={styles.patientLabel}>Paciente: {patient.first_name} {patient.last_name}</Text>
          )}

          <Text style={styles.label}>Nombre Medicamento</Text>
          <View style={styles.autocompleteContainer}>
            <TextInput style={styles.input} value={nombreBusqueda} onChangeText={handleBusqueda} placeholder="Ej: Acetaminofen" />
            {loadingSearch && <ActivityIndicator style={styles.loaderSearch} color="#2196F3" />}
            {showSuggestions && (
              <View style={styles.suggestions}>
                {filteredCatalog.map(m => (
                  <TouchableOpacity key={m.id} style={styles.suggestionItem} onPress={() => selectMedicine(m)}>
                    <Text style={styles.suggestionName}>{m.name}</Text>
                    <Text style={styles.suggestionDetail}>{m.principio_activo} | {m.concentracion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.label}>Dosis</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1.5 }]} keyboardType="numeric" value={dosisValor} onChangeText={setDosisValor} placeholder="Cant." />
            <View style={styles.pickerBox}>
              <Picker selectedValue={dosisUnidad} onValueChange={(v) => setDosisUnidad(v)}>
                <Picker.Item label="mg" value="mg" /><Picker.Item label="ml" value="ml" />
                <Picker.Item label="Tabletas" value="tabletas" /><Picker.Item label="Gotas" value="gotas" />
              </Picker>
            </View>
          </View>

          <Text style={styles.label}>Frecuencia (Cada cuánto)</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} keyboardType="numeric" value={frecuenciaValor} onChangeText={setFrecuenciaValor} placeholder="Ej: 8" />
            <View style={styles.pickerBox}>
              <Picker selectedValue={frecuenciaTipo} onValueChange={(v) => setFrecuenciaTipo(v)}>
                <Picker.Item label="Horas" value="Horas" /><Picker.Item label="Días" value="Días" />
              </Picker>
            </View>
          </View>

          <Text style={styles.label}>Duración del Tratamiento</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker('inicio')}>
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text> {fechaInicio.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker('fin')}>
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text> {fechaFin.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Horario Primera Toma</Text>
          <TouchableOpacity style={[styles.input, styles.rowAlignCenter]} onPress={() => setShowPicker('hora')}>
            <Ionicons name="time-outline" size={22} color="#2196F3" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 16 }}>{horaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.calcBtn} onPress={() => calcularPizarra()}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.calcBtnText}>GENERAR CALENDARIO</Text>}
          </TouchableOpacity>

          {planTomas.length > 0 && (
            <View style={styles.pizarraContainer}>
              <Text style={styles.label}>Configuración de Alarmas</Text>

              {/* Selector de alcance */}
              <View style={styles.selectorContainer}>
                <TouchableOpacity
                  style={[styles.optionBtn, generarTodo && styles.optionBtnActive]}
                  onPress={() => {
                    setGenerarTodo(true);
                    calcularPizarra(true); // <--- CAMBIO AQUÍ: Agregamos true
                  }}
                >
                  <Text style={[styles.optionText, generarTodo && styles.optionTextActive]}>Todo el Tratamiento</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionBtn, !generarTodo && styles.optionBtnActive]}
                  onPress={() => {
                    setGenerarTodo(false);
                    calcularPizarra(false); // <--- CAMBIO AQUÍ: Agregamos false
                  }}
                >
                  <Text style={[styles.optionText, !generarTodo && styles.optionTextActive]}>Solo una parte</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.helperText}>
                {generarTodo
                  ? "Se han generado todas las tomas hasta el fin del tratamiento. Puedes eliminar horas específicas con la (X)."
                  : "Se muestra una vista previa parcial. Revisa y ajusta las tomas necesarias."}
              </Text>

              {/* LISTA ÚNICA DE TOMAS CON BOTÓN DE BORRAR (X) */}
              <View style={styles.listaTomas}>
                <Text style={[styles.label, { marginTop: 10, fontSize: 14 }]}>Tomas a programar:</Text>
                {planTomas.map((t) => (
                  <View key={t.id} style={styles.tomaRow}>
                    <View style={styles.rowAlignCenter}>
                      <Ionicons name="notifications-outline" size={18} color="#4CAF50" />
                      <Text style={styles.tomaText}>
                        {" "}
                        {t.hora.toLocaleString([], {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setPlanTomas(planTomas.filter((x) => x.id !== t.id))}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={ejecutarGuardado}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>CONFIRMAR Y GUARDAR {planTomas.length} ALARMAS</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* SECCIÓN: MEDICAMENTOS ASIGNADOS */}
          <Text style={styles.sectionTitle}>Medicamentos asignados</Text>

          {assigned && assigned.length > 0 ? (
            assigned.map((pm) => (
              <View key={pm.id} style={styles.assignedItem}>
                <View style={styles.rowAlignCenter}>
                  <Ionicons name="medical" size={20} color="#2196F3" style={{ marginRight: 10 }} />
                  <View>
                    <Text style={styles.assignedName}>{pm.medicine_name || 'Sin nombre'}</Text>
                    <Text style={styles.assignedMeta}>
                      {pm.dose} • {pm.frequency}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: '#999', textAlign: 'center', marginTop: 10 }}>
              No hay medicamentos registrados aún.
            </Text>
          )}

          {showPicker && (
            <DateTimePicker
              value={showPicker === 'inicio' ? fechaInicio : showPicker === 'fin' ? fechaFin : horaInicio}
              mode={showPicker === 'hora' ? 'time' : 'date'}
              onChange={(e, d) => {
                setShowPicker(null);
                if (d) {
                  if (showPicker === 'inicio') setFechaInicio(d);
                  else if (showPicker === 'fin') setFechaFin(d);
                  else setHoraInicio(d);
                }
              }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#EEE' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  patientLabel: { color: '#2196F3', fontWeight: 'bold', marginBottom: 15, fontSize: 16 },
  label: { fontWeight: 'bold', marginTop: 20, marginBottom: 8, color: '#333', fontSize: 16 },
  autocompleteContainer: { zIndex: 1000 },
  input: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#E9ECEF' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  rowAlignCenter: { flexDirection: 'row', alignItems: 'center' },
  pickerBox: { flex: 1.2, backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF', overflow: 'hidden' },
  dateBtn: { flex: 1, backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E9ECEF' },
  calcBtn: { backgroundColor: '#2196F3', padding: 18, borderRadius: 12, marginTop: 25, alignItems: 'center' },
  calcBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  pizarraContainer: { marginTop: 20, backgroundColor: '#F8F9FA', padding: 15, borderRadius: 15 },
  tomaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#DEE2E6', alignItems: 'center' },
  tomaText: { fontSize: 14, color: '#495057' },
  saveBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  suggestions: { backgroundColor: '#FFF', elevation: 5, borderRadius: 12, marginTop: 5, borderWidth: 1, borderColor: '#EEE' },
  suggestionItem: { padding: 15, borderBottomWidth: 1, borderColor: '#F1F3F5' },
  suggestionName: { fontWeight: 'bold', fontSize: 15 },
  suggestionDetail: { color: '#6C757D', fontSize: 13 },
  loaderSearch: { position: 'absolute', right: 15, top: 18 },
  // Estilos para la sección de abajo
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 35, marginBottom: 15, color: '#333' },
  assignedItem: { padding: 15, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E9ECEF', elevation: 1 },
  assignedName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  assignedMeta: { fontSize: 13, color: '#666', marginTop: 2 },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#E9ECEF',
    borderRadius: 10,
    padding: 4,
    marginVertical: 10
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  optionBtnActive: {
    backgroundColor: '#FFF',
    elevation: 2
  },
  optionText: {
    color: '#666',
    fontWeight: '500'
  },
  optionTextActive: {
    color: '#2196F3',
    fontWeight: 'bold'
  },
  helperText: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 15,
    fontStyle: 'italic'
  },
  listaTomas: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
  }
});

export default MedicamentoScreen;