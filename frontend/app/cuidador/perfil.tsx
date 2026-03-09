import React from 'react';
import PerfilScreen from '../../src/screens/cuidador/PerfilScreen';
import { useGlobalSearchParams } from 'expo-router';

export default function Page() {
  const params = useGlobalSearchParams();
  const caregiverId = Number((params as any)?.id) || undefined;
  return <PerfilScreen caregiverId={caregiverId} />;
}