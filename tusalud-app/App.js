import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

//Importamos las vistas de Inicio
import LoginScreen from './LoginScreen'; 
import PacienteScreen from './screens/PacienteScreen';
import AdminScreen from './screens/AdminScreen';
import CuidadorScreen from './screens/CuidadorScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Paciente" component={PacienteScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="Cuidador" component={CuidadorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}