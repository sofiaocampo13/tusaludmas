import MedicamentoScreen from '../../src/screens/cuidador/MedicamentoScreen';
import { useGlobalSearchParams } from 'expo-router';

export default function Page() {
  const params = useGlobalSearchParams();
  const caregiverId = Number((params as any)?.id) || undefined;
  return <MedicamentoScreen caregiverId={caregiverId} />;
}