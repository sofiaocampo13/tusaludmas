import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator,Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// Importamos el servicio y la interfaz desde tu archivo de servicios
import { getAllMedicinesProvider, MedicineData } from '../../src/services/adminService';

export default function MedicinesScreen() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<MedicineData[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga los medicamentos al abrir la pantalla
  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    const response = await getAllMedicinesProvider();
    
    if (response.success && response.medicines) {
      setMedicines(response.medicines);
    } else {
      Alert.alert("Aviso", response.message || "No se encontraron medicamentos en la base de datos");
    }
    setLoading(false);
  };

  const renderMedicine = ({ item }: { item: MedicineData }) => (
    <View style={styles.medicineCard}>
      <View style={styles.iconContainer}>
        {/* Icono representativo de medicina */}
        <MaterialCommunityIcons name="pill" size={30} color="#F39C12" />
      </View>
      
      <View style={styles.infoContainer}>
        {/* Nombre del medicamento */}
        <Text style={styles.medName}>{item.name}</Text>
        {/* Descripción técnica o uso */}
        <Text style={styles.medDesc}>{item.description}</Text>
      </View>

      <TouchableOpacity 
        style={styles.detailBtn}
        onPress={() => Alert.alert("Detalles", `Medicamento: ${item.name}\nDescripción: ${item.description}`)}
      >
        <Ionicons name="information-circle-outline" size={24} color="#BDC3C7" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header personalizado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catálogo de Medicamentos</Text>
        <TouchableOpacity onPress={fetchMedicines}>
          <Ionicons name="refresh" size={24} color="#F39C12" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F39C12" />
          <Text style={styles.loadingText}>Consultando base de datos...</Text>
        </View>
      ) : (
        <FlatList
          data={medicines}
          renderItem={renderMedicine}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons name="emoticon-sad-outline" size={50} color="#CCC" />
              <Text style={styles.emptyText}>No hay medicamentos registrados todavía.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F4F6F7' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2C3E50' 
  },
  backBtn: {
    padding: 5
  },
  listContent: { 
    padding: 20 
  },
  medicineCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: { 
    backgroundColor: '#FEF5E7', 
    padding: 10, 
    borderRadius: 12 
  },
  infoContainer: { 
    marginLeft: 15, 
    flex: 1 
  },
  medName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#2C3E50' 
  },
  medDesc: { 
    fontSize: 13, 
    color: '#7F8C8D', 
    marginTop: 4 
  },
  detailBtn: {
    padding: 5
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 100 
  },
  loadingText: {
    marginTop: 10,
    color: '#F39C12',
    fontWeight: '600'
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 15, 
    color: '#95A5A6',
    fontSize: 14 
  }
});