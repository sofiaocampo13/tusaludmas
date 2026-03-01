import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { loginProvider, loginByCodeProvider} from '../src/services/authService'; // Tu servicio ya creado

export default function LoginScreen() {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'patient'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (type: 'standard' | 'code') => {
    setLoading(true);
    try {
      // CAMBIO AQUÍ: Elegir el servicio correcto según el tipo de login
      const data = type === 'standard'
        ? await loginProvider(identifier, password)
        : await loginByCodeProvider(linkCode); // Usamos el servicio de código

      if (data.success && data.user) {
        const user = data.user;
        const userData = {
          fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
          roleId: user.roles_id.toString(),
          code: user.link_code || linkCode
        };

        // Redirección
        if (user.roles_id === 1) {
          router.push({ pathname: '/admin' as any, params: userData as any });
        } else if (user.roles_id === 2 || type === 'code') {
          router.push({ pathname: '/paciente' as any, params: userData as any });
        } else if (user.roles_id === 3) {
          router.push({ pathname: '/cuidador' as any, params: userData as any });
        }
      } else {
        Alert.alert("Error", data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // --- VISTA DE VINCULACIÓN (PACIENTE) ---
  if (view === 'patient') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setView('login')}>
          <Text style={{ fontSize: 24, color: '#004080' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Vinculación entre cuentas</Text>
        <Text style={styles.subtitle}>Inserte el código de vinculación con el cuidador.</Text>
        <TextInput
          style={styles.codeInput}
          placeholder="A B C 6"
          maxLength={6}
          autoCapitalize="characters"
          onChangeText={setLinkCode}
        />
        <TouchableOpacity style={styles.buttonMain} onPress={() => handleLogin('code')}>
          <Text style={styles.buttonText}>{loading ? "CARGANDO..." : "ACCEDER"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- VISTA LOGIN ESTÁNDAR ---
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>TuSalud App</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico / Usuario"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.buttonMain} onPress={() => handleLogin('standard')}>
          <Text style={styles.buttonText}>{loading ? "ENTRANDO..." : "Iniciar Sesión"}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />
        <Text style={styles.smallText}>¿Todavía no tienes cuenta?</Text>
        <TouchableOpacity style={styles.buttonSecondary}><Text>Crear Cuenta</Text></TouchableOpacity>

        <TouchableOpacity style={styles.patientButton} onPress={() => setView('patient')}>
          <Text style={styles.patientButtonText}>SOY PACIENTE</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 5, marginBottom: 10 },
  codeInput: { borderBottomWidth: 2, fontSize: 30, textAlign: 'center', letterSpacing: 10, marginVertical: 30 },
  buttonMain: { backgroundColor: '#004080', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  buttonSecondary: { borderWidth: 1, padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  smallText: { textAlign: 'center', color: '#888' },
  backButton: { position: 'absolute', top: 50, left: 20 },
  patientButton: { backgroundColor: '#f0f0f0', padding: 20, marginTop: 30, borderWidth: 2, borderColor: '#004080' },
  patientButtonText: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#004080' }
});