import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
// Importamos el servicio de autenticación que ya tienes definido
import { loginProvider } from '../src/services/authService'; 

export default function WelcomePage() {
  const router = useRouter();
  
  // Estados para capturar las credenciales
  const [identifier, setIdentifier] = useState(''); // Usuario o Email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validación básica de campos vacíos
    if (!identifier || !password) {
      Alert.alert("Campos requeridos", "Por favor ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);

    try {
      // Llamada al backend usando tu servicio
      const data = await loginProvider(identifier, password);

      if (data.success) {
        const user = data.user;
        
        // Preparamos los parámetros según la estructura de tu tabla 'users'
        const userData = {
          fullName: `${user.first_name} ${user.last_name}`,
          code: user.link_code,
          roleId: user.roles_id
        };

        // Redirección lógica basada en el rol de la base de datos
        if (user.roles_id === 2) {
          // Si el rol es 2, es Paciente y va al Dashboard azul
          router.push({ pathname: '/paciente', params: userData });
        } else if (user.roles_id === 1) {
          // Si el rol es 1, es Administrador
          router.push({ pathname: '/admin', params: userData });
        } else {
          Alert.alert("Acceso Restringido", "Tu rol de usuario no tiene acceso a esta aplicación.");
        }

      } else {
        // Mensaje si el controlador devuelve success: false
        Alert.alert("Error de Inicio", data.message || "Credenciales incorrectas.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error de Conexión", "Asegúrate de que tu servidor esté encendido y en la misma red Wi-Fi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Título Principal */}
          <Text style={styles.title}>TuSalud App</Text>

          {/* Contenedor de Formulario */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico / Usuario"
              placeholderTextColor="#999"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Botón Iniciar Sesión */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert("Ayuda", "Contacta al administrador para recuperar tu clave.")}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Separador Visual */}
          <View style={styles.separatorContainer}>
            <View style={styles.line} />
            <Text style={styles.separatorText}>¿Todavía no tienes cuenta?</Text>
            <View style={styles.line} />
          </View>

          {/* Botón Crear Cuenta */}
          <TouchableOpacity 
            style={styles.outlineButton}
            onPress={() => Alert.alert("Registro", "Pantalla de registro próximamente.")}
          >
            <Text style={styles.outlineButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>

          {/* Botón Soy Paciente (Acceso por código) */}
          <TouchableOpacity 
            style={styles.patientButton}
            onPress={() => router.push('/login-code')} // Redirige a login por código
          >
            <Text style={styles.patientButtonText}>SOY PACIENTE</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
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
    backgroundColor: '#FAFAFA'
  },
  loginButton: {
    width: '100%',
    height: 55,
    backgroundColor: '#004282', // Azul institucional
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
    fontWeight: '500'
  },
  patientButton: {
    width: '100%',
    height: 70,
    backgroundColor: '#F0F0F0', // Gris claro
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