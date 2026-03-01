import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import CuidadorScreen from '../../src/screens/cuidador/CuidadorScreen';

export default function Page() {
  const params = useLocalSearchParams();
  
  const userData = {
    fullName: params.fullName || 'Cuidador',
    roleId: params.roleId
  };

  return <CuidadorScreen user={userData} />;
}