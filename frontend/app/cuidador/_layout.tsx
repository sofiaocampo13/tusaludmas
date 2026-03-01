import { Tabs } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function CuidadorLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#2196F3', // Color azul del mockup
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