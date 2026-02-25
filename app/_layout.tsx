import { Stack } from 'expo-router';
import "../global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login"/>
      <Stack.Screen name="menu-categorias"/>
      <Stack.Screen name="minhas-checklists"/>
    </Stack>
  );
}