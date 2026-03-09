import React from 'react';
import AgendarScreen from '../../src/screens/cuidador/AgendarScreen';
import { useGlobalSearchParams } from 'expo-router';

export default function Page() {
  const params = useGlobalSearchParams();
  const caregiverId = Number((params as any)?.id) || undefined;
  return <AgendarScreen caregiverId={caregiverId} />;
}