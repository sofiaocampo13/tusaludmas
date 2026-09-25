import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Modal
} from 'react-native';
import { SafeAreaView, SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ENDPOINTS } from '../../src/config/api';
import { TERMINOS_TEXTO, POLITICA_TEXTO } from '../../src/constants/legalContent';
import { isAdult, getMaxBirthDateForAdult, LEGAL_AGE } from '../../src/utils/age';

// ─── Componente visor de documentos legales ────────────────────────────────────

function LegalDocModal({
  visible, title, content, onClose
}: {
  visible: boolean; title: string; content: string; onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <RNSafeAreaView style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.headerTitle} numberOfLines={1}>{title}</Text>
          <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
            <Text style={modalStyles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modalStyles.body} showsVerticalScrollIndicator>
          <Text style={modalStyles.bodyText}>{content}</Text>
        </ScrollView>
      </RNSafeAreaView>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    backgroundColor: '#004080'
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#FFF', marginRight: 12 },
  closeBtn: { padding: 6 },
  closeBtnText: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },
  body: { padding: 20, paddingBottom: 40 },
  bodyText: { fontSize: 13, color: '#2C3E50', lineHeight: 22 },
});

// ─── Pantalla de registro ───────────────────────────────────────────────────────

// Formatea como YYYY-MM-DD en hora local: toISOString() pasa a UTC y en zonas
// con offset negativo devuelve el día anterior.
const toLocalDateString = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [roleType, setRoleType] = useState<'paciente' | 'cuidador'>('paciente');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const passwordRules = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Una letra mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Una letra minúscula', ok: /[a-z]/.test(password) },
    { label: 'Un número', ok: /\d/.test(password) },
  ];

  const handleRegister = async () => {
    if (!firstName || !lastName || !username || !email || !password || !phone || !birthDate) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }
    if (!isAdult(birthDate)) {
      Alert.alert(
        "Error",
        `Debes ser mayor de edad (${LEGAL_AGE} años cumplidos) para registrarte.`
      );
      return;
    }
    if (!passwordRules.every(r => r.ok)) {
      Alert.alert("Error", "La contraseña no cumple todos los requisitos.");
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
          username,
          email,
          password,
          phone,
          birth_date: birthDate ? toLocalDateString(birthDate) : '',
          roleType,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (roleType === 'paciente' && data.link_code) {
          Alert.alert(
            "¡Registro exitoso!",
            `Tu código de vinculación es:\n\n${data.link_code}\n\nGuárdalo, lo necesitarás para conectarte con tu cuidador.`,
            [{ text: "Entendido", onPress: () => router.push('/auth/login') }]
          );
        } else {
          Alert.alert("¡Éxito!", "Registro completado.", [
            { text: "OK", onPress: () => router.push('/auth/login') }
          ]);
        }
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
            <TextInput placeholderTextColor="#9CA3AF" style={styles.input} placeholder="Tu nombre" value={firstName} onChangeText={setFirstName} />

            <Text style={styles.label}>Apellido</Text>
            <TextInput placeholderTextColor="#9CA3AF" style={styles.input} placeholder="Tu apellido" value={lastName} onChangeText={setLastName} />

            <Text style={styles.label}>Nombre de usuario</Text>
            <TextInput placeholderTextColor="#9CA3AF"
              style={styles.input} placeholder="Ej: juan123" autoCapitalize="none"
              value={username} onChangeText={setUsername}
            />

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput placeholderTextColor="#9CA3AF"
              style={styles.input} placeholder="ejemplo@correo.com" keyboardType="email-address"
              autoCapitalize="none" value={email} onChangeText={setEmail}
            />

            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput placeholderTextColor="#9CA3AF"
                style={styles.passwordInput}
                placeholder="Mínimo 8 caracteres"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#7F8C8D" />
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
              <View style={styles.rulesContainer}>
                {passwordRules.map((rule) => (
                  <View key={rule.label} style={styles.ruleRow}>
                    <Ionicons
                      name={rule.ok ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={rule.ok ? '#4CAF50' : '#E57373'}
                    />
                    <Text style={[styles.ruleText, { color: rule.ok ? '#4CAF50' : '#E57373' }]}>
                      {' '}{rule.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.label}>Teléfono</Text>
            <TextInput placeholderTextColor="#9CA3AF"
              style={styles.input} placeholder="Ej: 3001234567" keyboardType="phone-pad"
              value={phone} onChangeText={setPhone}
            />

            <Text style={styles.label}>Fecha de nacimiento</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
              <Text style={birthDate ? styles.dateText : styles.datePlaceholder}>
                {birthDate ? birthDate.toLocaleDateString() : 'Seleccionar fecha'}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={birthDate ?? new Date(2000, 0, 1)}
                mode="date"
                minimumDate={new Date(1900, 0, 1)}
                maximumDate={getMaxBirthDateForAdult()}
                onValueChange={(_, date) => {
                  setShowPicker(false);
                  setBirthDate(date);
                }}
                onDismiss={() => setShowPicker(false)}
              />
            )}

            {/* ACEPTACIÓN DE TÉRMINOS */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
                {acceptedTerms && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                {'Acepto los '}
                <Text
                  style={styles.termsLink}
                  onPress={(e) => { e.stopPropagation(); setShowTermsModal(true); }}
                >
                  términos y condiciones de uso
                </Text>
                {' y las '}
                <Text
                  style={styles.termsLink}
                  onPress={(e) => { e.stopPropagation(); setShowPolicyModal(true); }}
                >
                  políticas de tratamiento de datos
                </Text>
                {'.'}
              </Text>
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

      {/* MODALES DE DOCUMENTOS LEGALES */}
      <LegalDocModal
        visible={showTermsModal}
        title="Términos y Condiciones de Uso"
        content={TERMINOS_TEXTO}
        onClose={() => setShowTermsModal(false)}
      />
      <LegalDocModal
        visible={showPolicyModal}
        title="Política de Tratamiento de Datos Personales"
        content={POLITICA_TEXTO}
        onClose={() => setShowPolicyModal(false)}
      />
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
  input: { backgroundColor: '#F9FAFB', padding: 14, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', color: '#1a1a1a' },
  roleSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleOption: { flex: 0.48, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, alignItems: 'center' },
  roleOptionActive: { backgroundColor: '#004080', borderColor: '#004080' },
  roleOptionText: { color: '#7F8C8D', fontWeight: 'bold' },
  roleOptionTextActive: { color: '#FFF' },
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#004080', borderRadius: 5, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#004080' },
  checkMark: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  termsText: { flex: 1, fontSize: 13, color: '#7F8C8D' },
  termsLink: { color: '#004080', fontWeight: '600', textDecorationLine: 'underline' },
  registerBtn: { backgroundColor: '#004080', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  registerBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  backLink: { textAlign: 'center', marginTop: 20, color: '#004080', fontWeight: '700' },
  dateInput: { backgroundColor: '#F9FAFB', padding: 14, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center' },
  dateText: { fontSize: 14, color: '#1a1a1a' },
  datePlaceholder: { fontSize: 14, color: '#9CA3AF' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  passwordInput: { flex: 1, padding: 14, color: '#1a1a1a' },
  eyeBtn: { paddingHorizontal: 14 },
  rulesContainer: { marginBottom: 15, gap: 4 },
  ruleRow: { flexDirection: 'row', alignItems: 'center' },
  ruleText: { fontSize: 12 },
});
