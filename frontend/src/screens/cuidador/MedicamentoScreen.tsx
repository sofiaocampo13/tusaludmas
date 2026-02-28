import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MedicamentoScreen() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState('Mie'); // Ejemplo del mockup

  const diasSemana = [
    { num: '20', label: 'Dom' }, { num: '21', label: 'Lun' },
    { num: '22', label: 'Mar' }, { num: '23', label: 'Mie' },
    { num: '24', label: 'Jue' }, { num: '25', label: 'Vie' },
    { num: '26', label: 'Sab' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con flecha atrás como el mockup */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Medicamento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Selector de Fecha Horizontal */}
        <View style={styles.calendarStrip}>
          {diasSemana.map((item, index) => (
            <View key={index} style={[styles.dayItem, item.label === 'Mie' && styles.dayActive]}>
              <Text style={[styles.dayText, item.label === 'Mie' && styles.dayTextActive]}>{item.num}</Text>
              <Text style={[styles.dayLabel, item.label === 'Mie' && styles.dayTextActive]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.label}>Nombre Medicamento</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Nombre" 
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Descripción" 
          multiline
          numberOfLines={4}
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Text style={styles.label}>Repetir</Text>
        <View style={styles.daysContainer}>
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((dia, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.dayCircle, (i === 1 || i === 2) && styles.dayCircleActive]} // Ejemplo visual
            >
              <Text style={[styles.dayCircleText, (i === 1 || i === 2) && styles.dayTextActive]}>{dia}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Horario</Text>
        <View style={styles.timeContainer}>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>6:00am</Text>
          </View>
          <TouchableOpacity style={styles.addTimeBtn}>
            <Ionicons name="add" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createBtn}>
          <Text style={styles.createBtnText}>Crear</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#EEE' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  calendarStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  dayItem: { alignItems: 'center', padding: 10, borderRadius: 10 },
  dayActive: { backgroundColor: '#2196F3' },
  dayText: { fontSize: 16, color: '#999' },
  dayLabel: { fontSize: 12, color: '#999' },
  dayTextActive: { color: '#FFF', fontWeight: 'bold' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#F0F0F0', borderRadius: 12, padding: 15, marginBottom: 20, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  daysContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  dayCircle: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  dayCircleActive: { backgroundColor: '#2196F3' },
  dayCircleText: { fontSize: 14, color: '#666' },
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  timeBadge: { backgroundColor: '#2196F3', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  timeText: { color: '#FFF', fontWeight: 'bold' },
  addTimeBtn: { marginLeft: 15 },
  createBtn: { backgroundColor: '#2196F3', padding: 18, borderRadius: 30, alignItems: 'center' },
  createBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});