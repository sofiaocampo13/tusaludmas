import { Stack } from 'expo-router';

export default function WebLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Esto obliga a la web a solo reconocer la carpeta de la EPS */}
      <Stack.Screen name="eps/index" /> 
      <Stack.Screen name="index" />
    </Stack>
  );
}