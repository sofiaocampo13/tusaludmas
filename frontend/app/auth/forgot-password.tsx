import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { forgotPasswordProvider, resetPasswordProvider } from '../../src/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  // Paso 1: pedir el código al correo. Paso 2: escribir el código y la nueva contraseña.
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  // Mismas reglas que el registro
  const passwordRules = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Una letra mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Una letra minúscula', ok: /[a-z]/.test(password) },
    { label: 'Un número', ok: /\d/.test(password) },
  ];

  const handleResetRequest = async () => {
    const correo = email.trim();
    if (!correo.includes('@')) {
      Alert.alert("Error", "Por favor ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);
    const result = await forgotPasswordProvider(correo);
    setLoading(false);

    if (result.success) {
      setEmail(correo);
      setStep('code');
      Alert.alert("Revisa tu correo", result.message || "Si el correo está registrado, te enviamos un código.");
    } else {
      Alert.alert("Error", result.message || "No se pudo procesar la solicitud.");
    }
  };

  const handleReset = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      Alert.alert("Error", "El código tiene 6 números.");
      return;
    }
    if (!passwordRules.every(r => r.ok)) {
      Alert.alert("Error", "La contraseña no cumple todos los requisitos.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const result = await resetPasswordProvider(email, code.trim(), password);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Contraseña actualizada",
        result.message || "Ya puedes iniciar sesión con tu nueva contraseña.",
        [{ text: "Iniciar sesión", onPress: () => router.replace('/auth/login' as any) }]
      );
    } else {
      Alert.alert("Error", result.message || "No se pudo actualizar la contraseña.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backButton} onPress={() => (step === 'code' ? setStep('email') : router.back())}>
        <Text style={{ fontSize: 24, color: '#004080' }}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Recuperar Contraseña</Text>

      {step === 'email' ? (
        <>
          <Text style={styles.subtitle}>
            Introduce tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
          </Text>

          <TextInput placeholderTextColor="#9CA3AF"
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
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ENVIAR CÓDIGO</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Escribe el código de 6 números que enviamos a {email} y elige tu nueva contraseña. El código vence en 15 minutos.
          </Text>

          <TextInput placeholderTextColor="#9CA3AF"
            style={styles.input}
            placeholder="Código de 6 números"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TextInput placeholderTextColor="#9CA3AF"
            style={styles.input}
            placeholder="Nueva contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <View style={styles.rules}>
            {passwordRules.map(r => (
              <Text key={r.label} style={{ color: r.ok ? '#27AE60' : '#999', fontSize: 12 }}>
                {r.ok ? '✓' : '•'} {r.label}
              </Text>
            ))}
          </View>
          <TextInput placeholderTextColor="#9CA3AF"
            style={styles.input}
            placeholder="Confirmar nueva contraseña"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.buttonMain, loading && { opacity: 0.7 }]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>CAMBIAR CONTRASEÑA</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.resend} onPress={handleResetRequest} disabled={loading}>
            <Text style={styles.resendText}>¿No te llegó? Enviar un código nuevo</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  backButton: { position: 'absolute', top: 50, left: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#004080' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 30, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 8, marginBottom: 20, color: '#1a1a1a' },
  rules: { marginTop: -12, marginBottom: 20, gap: 2 },
  buttonMain: { backgroundColor: '#004080', padding: 18, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resend: { marginTop: 20, alignItems: 'center' },
  resendText: { color: '#004080', textDecorationLine: 'underline' },
});
