import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ENDPOINTS } from '../../src/config/api';

export default function RegisterPage() {
  const router = useRouter();
  
  // Estados del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState(''); // Nuevo para paciente
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleType, setRoleType] = useState<'paciente' | 'cuidador'>('paciente');
  const [acceptedTerms, setAcceptedTerms] = useState(false); // Para políticas
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validación básica según el rol
    if (!firstName || !lastName || (roleType === 'paciente' && !age) || (roleType === 'cuidador' && (!email || !password))) {
      Alert.alert("Error", "Por favor completa todos los campos requeridos.");
      return;
    }

    if (!acceptedTerms) {
      Alert.alert("Aviso", "Debes aceptar las políticas de privacidad para continuar.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          age: roleType === 'paciente' ? age : null,
          email: roleType === 'cuidador' ? email : null,
          password: roleType === 'cuidador' ? password : null,
          roleType: roleType 
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert("¡Éxito!", "Registro completado.");
        router.push('/auth/login'); 
      } else {
        Alert.alert("Error", data.message || "No se pudo registrar.");
      }
    } catch (error) {
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
          <Text style={styles.subtitle}>Configura tu perfil en TuSalud+</Text>

          <View style={styles.form}>
            {/* SELECTOR DE ROL PRIMERO PARA CAMBIAR EL FORMULARIO */}
            <Text style={styles.label}>¿Quién eres?</Text>
            <View style={styles.roleSelectorContainer}>
              <TouchableOpacity 
                style={[styles.roleOption, roleType === 'paciente' && styles.roleOptionActive]}
                onPress={() => setRoleType('paciente')}
              >
                <Text style={[styles.roleOptionText, roleType === 'paciente' && styles.roleOptionTextActive]}>Soy Paciente</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roleOption, roleType === 'cuidador' && styles.roleOptionActive]}
                onPress={() => setRoleType('cuidador')}
              >
                <Text style={[styles.roleOptionText, roleType === 'cuidador' && styles.roleOptionTextActive]}>Soy Cuidador</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} placeholder="Tu nombre" value={firstName} onChangeText={setFirstName} />

            <Text style={styles.label}>Apellido</Text>
            <TextInput style={styles.input} placeholder="Tu apellido" value={lastName} onChangeText={setLastName} />

            {/* CAMPOS CONDICIONALES */}
            {roleType === 'paciente' ? (
              <>
                <Text style={styles.label}>Edad</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ej: 25" 
                  keyboardType="numeric" 
                  value={age} 
                  onChangeText={setAge} 
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="ejemplo@correo.com" 
                  keyboardType="email-address" 
                  autoCapitalize="none"
                  value={email} 
                  onChangeText={setEmail} 
                />
                <Text style={styles.label}>Contraseña</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Mínimo 6 caracteres" 
                  secureTextEntry 
                  value={password} 
                  onChangeText={setPassword} 
                />
              </>
            )}

            {/* POLÍTICAS DE PRIVACIDAD */}
            <TouchableOpacity 
              style={styles.termsContainer} 
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
                {acceptedTerms && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>Acepto las políticas de privacidad y términos de uso.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.registerBtn, (loading || !acceptedTerms) && { opacity: 0.6 }]} 
              onPress={handleRegister}
              disabled={loading || !acceptedTerms}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.registerBtnText}>Finalizar Registro</Text>}
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
  outerContainer: { flex: 1, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  appCanvas: { flex: 1, width: '100%', backgroundColor: '#FFF' },
  content: { padding: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#004080', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#7F8C8D', marginBottom: 25 },
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#34495E', marginBottom: 5 },
  input: { backgroundColor: '#F9FAFB', padding: 14, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  roleSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleOption: { flex: 0.48, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, alignItems: 'center' },
  roleOptionActive: { backgroundColor: '#004080', borderColor: '#004080' },
  roleOptionText: { color: '#7F8C8D', fontWeight: 'bold' },
  roleOptionTextActive: { color: '#FFF' },
  // Estilos del Checkbox
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#004080', borderRadius: 5, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#004080' },
  checkMark: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  termsText: { flex: 1, fontSize: 13, color: '#7F8C8D' },
  registerBtn: { backgroundColor: '#004080', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  registerBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  backLink: { textAlign: 'center', marginTop: 20, color: '#004080', fontWeight: '700' }
});