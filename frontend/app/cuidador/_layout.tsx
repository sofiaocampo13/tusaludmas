import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Alto de la barra sin contar la zona del sistema (gestos o botones de Android).
const TAB_BAR_HEIGHT = 65;
const TAB_BAR_PADDING_BOTTOM = 10;

export default function CuidadorLayout() {
  // Al fijar `height` en tabBarStyle, React Navigation deja de sumar el inset
  // inferior por su cuenta, así que hay que sumarlo aquí manualmente.
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Cerrar sesión',
        '¿Deseas cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cerrar sesión', style: 'destructive', onPress: () => router.replace('/') },
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
      tabBarStyle: {
        height: TAB_BAR_HEIGHT + insets.bottom,
        paddingBottom: TAB_BAR_PADDING_BOTTOM + insets.bottom,
      }
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