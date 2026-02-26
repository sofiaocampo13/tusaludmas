import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Título Principal */}
        <Text style={styles.title}>TuSalud App</Text>

        {/* Inputs de Login */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico / Usuario"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Botón Iniciar Sesión */}
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => console.log('Login presionado')}
        >
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>¿Todavía no tienes cuenta?</Text>
          <View style={styles.line} />
        </View>

        {/* Botón Crear Cuenta */}
        <TouchableOpacity style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Crear Cuenta</Text>
        </TouchableOpacity>

        {/* Botón Soy Paciente */}
        <TouchableOpacity 
          style={styles.patientButton}
          onPress={() => router.push('/login')} // Esto te llevará a tu otra lógica de login si la necesitas
        >
          <Text style={styles.patientButtonText}>SOY PACIENTE</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#000',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 55,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    height: 55,
    backgroundColor: '#004282', // El azul oscuro de tu imagen
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotText: {
    color: '#004282',
    fontSize: 16,
    marginBottom: 30,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  separatorText: {
    marginHorizontal: 10,
    color: '#999999',
    fontSize: 14,
  },
  outlineButton: {
    width: '100%',
    height: 55,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  outlineButtonText: {
    color: '#000000',
    fontSize: 16,
  },
  patientButton: {
    width: '100%',
    height: 70,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#004282',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  patientButtonText: {
    color: '#004282',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});