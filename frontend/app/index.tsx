import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            {/* El círculo del logo ahora es el azul oscuro oficial */}
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
  // Círculo del logo unificado
  logoPlaceholder: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: '#004080', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logoText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  // Título principal ahora más oscuro para combinar mejor
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#004080', marginBottom: 10 },
  welcomeSubtitle: { fontSize: 16, color: '#7F8C8D', marginBottom: 50 },
  buttonContainer: { width: '100%' },
  // Botón principal unificado
  loginBtn: { 
    backgroundColor: '#004080', 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginBottom: 15 
  },
  loginBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  // Botón secundario con borde azul oscuro
  registerBtn: { 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: '#004080' 
  },
  registerBtnText: { color: '#004080', fontWeight: 'bold', fontSize: 16 },
});