import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Importamos la función que creamos en el servicio
import { updateUserProvider, UserData } from '../../src/services/adminService';

export default function EditUserScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado para los datos del usuario
  const [formData, setFormData] = useState<UserData | null>(null);

  useEffect(() => {
    if (params.user) {
      try {
        // Convertimos el string que viene de la lista en un objeto real
        const userData: UserData = JSON.parse(params.user as string);
        setFormData(userData);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los datos del usuario");
      }
    }
    setLoading(false);
  }, [params.user]);

  const handleSave = async () => {
    if (!formData) return;

    // Validación básica de correo
    if (!formData.email.includes('@')) {
      Alert.alert("Error", "Por favor ingresa un correo electrónico válido.");
      return;
    }

    setSaving(true);
    
    // Llamada real a la base de datos a través del servicio
    const response = await updateUserProvider(formData.id, {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      username: formData.username,
      roles_id: formData.roles_id
    });

    setSaving(false);

    if (response.success) {
      Alert.alert("Éxito", "Usuario actualizado en la base de datos", [
        { text: "OK", onPress: () => router.replace('/admin/users') }
      ]);
    } else {
      Alert.alert("Error", response.message || "No se pudo guardar en MySQL");
    }
  };

  if (loading || !formData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#004080" />
        <Text style={{ marginTop: 10 }}>Cargando datos reales...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.blueBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.blueBarText}>Editar Perfil</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.formSection}>
            <Text style={styles.label}>Nombres</Text>
            <TextInput 
              style={styles.input}
              value={formData.first_name}
              onChangeText={(text) => setFormData({...formData, first_name: text})}
              placeholder="Ej: Juan"
            />

            <Text style={styles.label}>Apellidos</Text>
            <TextInput 
              style={styles.input}
              value={formData.last_name}
              onChangeText={(text) => setFormData({...formData, last_name: text})}
              placeholder="Ej: Pérez"
            />

            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput 
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={true} // AHORA SÍ ES EDITABLE
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput 
              style={styles.input}
              value={formData.phone || ''}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              keyboardType="phone-pad"
              placeholder="Ej: 3001234567"
            />

           { /*<Text style={styles.label}>Rol asignado</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={[styles.roleOption, formData.roles_id === 2 && styles.roleActive]}
                onPress={() => setFormData({...formData, roles_id: 2})}
              >
                <Text style={[styles.roleText, formData.roles_id === 2 && styles.roleTextActive]}>Paciente</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.roleOption, formData.roles_id === 3 && styles.roleActive]}
                onPress={() => setFormData({...formData, roles_id: 3})}
              >
                <Text style={[styles.roleText, formData.roles_id === 3 && styles.roleTextActive]}>Cuidador</Text>
              </TouchableOpacity>
            </View> */ }
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Guardar en Base de Datos</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  blueBar: { 
    backgroundColor: '#004080', 
    height: 100, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40
  },
  blueBarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 5 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 25 },
  formSection: { marginBottom: 30 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#004080', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E1E4E8'
  },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  roleOption: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#004080',
    alignItems: 'center'
  },
  roleActive: { backgroundColor: '#004080' },
  roleText: { color: '#004080', fontWeight: 'bold' },
  roleTextActive: { color: '#FFF' },
  saveBtn: {
    backgroundColor: '#004080',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});