import React from 'react';
import AdminScreen from '../src/screens/AdminScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Page() {
  const params = useLocalSearchParams();
  
  // Mapeamos los params que vienen del login hacia el componente visual
  const adminData = {
    fullName: params.fullName || 'Admin',
    roleId: params.roleId
  };

  return <AdminScreen user={adminData} />;
}