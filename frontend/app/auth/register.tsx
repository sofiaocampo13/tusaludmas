import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Platform, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterPage() {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleType, setRoleType] = useState('paciente'); // El estado sigue siendo el mismo para el backend
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);

    try {
      // Recuerda cambiar localhost por tu IP si pruebas en celular real
      const response = await fetch('http://192.168.1.2:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          roleType: roleType 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("¡Éxito!", "Usuario registrado correctamente.");
        router.push('/auth/login'); 
      } else {
        Alert.alert("Error", data.message || "No se pudo registrar.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No hay conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.appCanvas}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Regístrate en TuSalud+</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Tu nombre" 
              value={firstName} 
              onChangeText={setFirstName} 
            />

            <Text style={styles.label}>Apellido</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Tu apellido" 
              value={lastName} 
              onChangeText={setLastName} 
            />

            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ejemplo@correo.com" 
              keyboardType="email-address" 
              autoCapitalize="none"
              value={email} 
              onChangeText={setEmail} 
            />

            {/* --- NUEVO SELECTOR DE ROLES (ADIÓS PICKER) --- */}
            <Text style={styles.label}>¿Quién eres?</Text>
            <View style={styles.roleSelectorContainer}>
              <TouchableOpacity 
                style={[styles.roleOption, roleType === 'paciente' && styles.roleOptionActive]}
                onPress={() => setRoleType('paciente')}
              >
                <Text style={[styles.roleOptionText, roleType === 'paciente' && styles.roleOptionTextActive]}>
                  Soy Paciente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roleOption, roleType === 'cuidador' && styles.roleOptionActive]}
                onPress={() => setRoleType('cuidador')}
              >
                <Text style={[styles.roleOptionText, roleType === 'cuidador' && styles.roleOptionTextActive]}>
                  Soy Cuidador
                </Text>
              </TouchableOpacity>
            </View>
            {/* ------------------------------------------- */}

            <Text style={styles.label}>Contraseña</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Mínimo 6 caracteres" 
              secureTextEntry 
              value={password} 
              onChangeText={setPassword} 
            />

            <TouchableOpacity 
              style={[styles.registerBtn, loading && { opacity: 0.7 }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.registerBtnText}>Registrarse Ahora</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backLink}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { 
    flex: 1, 
    backgroundColor: Platform.OS === 'web' ? '#F0F2F5' : '#FFF', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  appCanvas: { 
    flex: 1, 
    width: Platform.OS === 'web' ? 400 : '100%', 
    backgroundColor: '#FFF',
    ...(Platform.OS === 'web' && { 
      borderWidth: 1, 
      borderColor: '#DDD', 
      borderRadius: 30, 
      marginVertical: 20 
    })
  },
  content: { padding: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E86C1', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#7F8C8D', marginBottom: 25 },
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#34495E', marginBottom: 5 },
  input: { 
    backgroundColor: '#F9FAFB', 
    padding: 14, 
    borderRadius: 12, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  // Estilos nuevos para el selector de botones
  roleSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleOption: {
    flex: 0.48,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  roleOptionActive: {
    backgroundColor: '#2E86C1',
    borderColor: '#2E86C1',
  },
  roleOptionText: {
    color: '#7F8C8D',
    fontWeight: 'bold',
  },
  roleOptionTextActive: {
    color: '#FFF',
  },
  registerBtn: { 
    backgroundColor: '#2E86C1', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10 
  },
  registerBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  backLink: { textAlign: 'center', marginTop: 20, color: '#2E86C1', fontWeight: '700' }
});