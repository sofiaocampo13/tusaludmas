import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

<<<<<<< HEAD
=======
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
          first_name: user.first_name,
          last_name: user.last_name,
          roleId: user.roles_id.toString(),
          code: user.link_code || linkCode,
          id: user.id,
          roles_id: user.roles_id,
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
>>>>>>> 9ffd24b (Cambios locales antes de sincronizar con main)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>TUSALUD+</Text>
          </View>
        </View>

        <Text style={styles.welcomeTitle}>Bienvenido a TuSalud+</Text>
        <Text style={styles.welcomeSubtitle}>Tu bienestar, nuestra prioridad.</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginBtn} 
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerBtn} 
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.registerBtnText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  logoContainer: { marginBottom: 40 },
  logoPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#3498DB', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  welcomeSubtitle: { fontSize: 16, color: '#7F8C8D', marginBottom: 50 },
  buttonContainer: { width: '100%' },
  loginBtn: { backgroundColor: '#3498DB', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  loginBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  registerBtn: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#3498DB' },
  registerBtnText: { color: '#3498DB', fontWeight: 'bold', fontSize: 16 },
});