import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function CuidadorLayout() {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Cerrar sesión',
        '¿Deseas salir de la aplicación?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: () => router.replace('/') },
        ]
      );
      return true; // bloquea la navegación por defecto
    });
    return () => sub.remove();
  }, []);

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#004080', // Color azul del mockup
      tabBarStyle: { height: 65, paddingBottom: 10 }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="medicamento"
        options={{
          title: 'Medicamento',
          tabBarIcon: ({ color }) => <FontAwesome5 name="pills" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="agendar"
        options={{
          title: 'Agendar',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}