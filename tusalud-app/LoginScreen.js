import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [linkCode, setLinkCode] = useState('');

  const handleLogin = async (type) => {
    const url = type === 'standard' ? 'http://10.107.93.99:3000/login' : 'http://10.107.93.99:3000/login-code'; //Corregir siempre, según IP
    const body = type === 'standard' ? { username, password } : { code: linkCode };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (data.success) {
        const userRole = data.user.role;
        const rolesId = data.user.roles_id;

        // 1. Creamos el usuario con el nombre completo ya procesado
        const fullUser = {
          ...data.user,
          fullName: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim() || data.user.username,
          // Mantenemos la compatibilidad con el código anterior
          link_code: data.user.link_code || linkCode,
          paciente_nombre: data.user.first_name || data.user.username
        };

        // 2. Lógica para ADMINISTRADOR
        if (userRole === 'Administrador' || rolesId === 1) {
          // CAMBIO: Pasar fullUser
          navigation.navigate('Admin', { user: fullUser });
        }

        // 3. Lógica para PACIENTE
        else if (userRole === 'Paciente' || rolesId === 2 || type === 'code') {
          // CAMBIO: Pasar fullUser (que ya trae link_code y fullName)
          navigation.navigate('Paciente', { user: fullUser });
        }

        // 4. Lógica para CUIDADOR
        else if (userRole === 'Cuidador' || rolesId === 3) {
          // CAMBIO: Pasar fullUser
          navigation.navigate('Cuidador', { user: fullUser });
        }
      } else {
        Alert.alert("Error", data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  // --- DISEÑO DE VISTA DE VINCULACIÓN (PACIENTE) ---
  if (view === 'patient') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setView('login')}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Vinculación entre cuentas</Text>
        <Text style={styles.subtitle}>Inserte el código de vinculación con el cuidador.</Text>

        <TextInput
          style={styles.codeInput}
          placeholder="A B C 6"
          maxLength={4}
          autoCapitalize="characters"
          onChangeText={setLinkCode}
        />

        <TouchableOpacity style={styles.buttonMain} onPress={() => handleLogin('code')}>
          <Text style={styles.buttonText}>ACCEDER</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- DISEÑO DE VISTA LOGIN ESTÁNDAR ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TuSalud App</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico / Usuario"
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.buttonMain} onPress={() => handleLogin('standard')}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity><Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text></TouchableOpacity>

      <View style={styles.divider} />
      <Text style={styles.smallText}>¿Todavía no tienes cuenta?</Text>
      <TouchableOpacity style={styles.buttonSecondary}><Text>Crear Cuenta</Text></TouchableOpacity>

      <TouchableOpacity style={styles.patientButton} onPress={() => setView('patient')}>
        <Text style={styles.patientButtonText}>SOY PACIENTE</Text>
      </TouchableOpacity>
    </View>
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
  linkText: { color: '#004080', textAlign: 'center', marginTop: 15 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  smallText: { textAlign: 'center', color: '#888' },
  backButton: { position: 'absolute', top: 50, left: 20 },
  patientButton: { backgroundColor: '#f0f0f0', padding: 20, marginTop: 30, borderWidth: 2, borderColor: '#004080' },
  patientButtonText: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#004080' }
});