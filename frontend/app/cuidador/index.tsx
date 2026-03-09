import React from 'react';
import { useGlobalSearchParams } from 'expo-router';
import CuidadorScreen from '../../src/screens/cuidador/CuidadorScreen';
import type { CuidadorUser } from '../../src/types/database';

function str(v: unknown): string {
  return Array.isArray(v) ? v[0] ?? '' : (v as string) ?? '';
}

export default function Page() {
  const params = useGlobalSearchParams();
  
  const user: CuidadorUser = {
    fullName: str(params.fullName) || 'Cuidador',
    first_name: str(params.first_name) || null,
    last_name: str(params.last_name) || null,
    username: '',
    id: Number(str(params.id)) || 0,
    roles_id: Number(str(params.roles_id)) || 3,
  };

  return <CuidadorScreen user={user} />;
}