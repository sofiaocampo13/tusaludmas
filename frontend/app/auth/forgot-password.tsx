import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { forgotPasswordProvider } from '../../src/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async () => {
    if (!email.includes('@')) {
      Alert.alert("Error", "Por favor ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);
    const result = await forgotPasswordProvider(email);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Correo Enviado", 
        "Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } else {
      Alert.alert("Error", result.message || "No se pudo procesar la solicitud.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={{ fontSize: 24, color: '#004080' }}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Recuperar Contraseña</Text>
      <Text style={styles.subtitle}>
        Introduce tu correo electrónico y te enviaremos los pasos para recuperar tu acceso.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="correo@ejemplo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity 
        style={[styles.buttonMain, loading && { opacity: 0.7 }]} 
        onPress={handleResetRequest}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>ENVIAR INSTRUCCIONES</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  backButton: { position: 'absolute', top: 50, left: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#004080' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 30, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 8, marginBottom: 20 },
  buttonMain: { backgroundColor: '#004080', padding: 18, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});