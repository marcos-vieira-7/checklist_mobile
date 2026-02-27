import { Stack } from 'expo-router';
import "../global.css";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      
    <StatusBar
      style="light"
      backgroundColor="#1976D2"
      translucent={false} // 🔥 ISSO RESOLVE
    />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1976D2',
          },
            headerTintColor: '#fff',
            headerTitleStyle: {
            fontWeight: 'bold',
          },
          }}

      >
        <Stack.Screen name="login" options={{ headerShown: false}} /> 
        <Stack.Screen name="menu-categorias"/>
        <Stack.Screen name="minhas-checklists"/>
        <Stack.Screen name="menu-modelos"/>
        <Stack.Screen name="form-checklist"/>
      </Stack>
    </SafeAreaProvider>
  );
}