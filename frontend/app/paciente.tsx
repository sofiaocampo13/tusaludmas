import React from 'react';
import PacienteScreen from '../src/screens/PacienteScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Page() {
  // Extraemos los parámetros que vienen del router.push de la pantalla anterior
  const params = useLocalSearchParams();
  
  // Si no hay parámetros (por si entras directo), ponemos datos vacíos para que no truene
  const userData = {
    fullName: params.fullName || 'Usuario',
    link_code: params.code || '----'
  };

  // Le pasamos el objeto user al componente tal como él lo espera
  return <PacienteScreen user={userData} />;
}