import { Stack } from 'expo-router';
import "../global.css";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, ToastAndroid, View } from 'react-native';
import { logout } from '../utils/logout';
import { AntDesign, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { updateLocalDatabase } from '../services/sync';
import { useNetInfo } from '@react-native-community/netinfo';

export default function RootLayout() {

  const { isConnected } = useNetInfo();

  return (
    <SafeAreaProvider>

      <StatusBar
        style="light"
        // backgroundColor="#1976D2"
        // translucent={false}
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
        <Stack.Screen name="login" options={{ headerShown: false }} />

        <Stack.Screen name="menu-categorias" options={{
          title: 'Categorias', headerRight: () => (
            <View className="flex flex-row gap-8">
              {isConnected && <FontAwesome5 onPress={() => updateLocalDatabase().then(() => ToastAndroid.show("Atualizado com sucesso!", ToastAndroid.SHORT))} name="sync-alt" size={20} color="#fff" />}
              <Pressable
                onPress={logout}
                style={{ marginRight: 10 }}
              >
                <Text className='text-white'>sair</Text>
              </Pressable>
            </View>
          )
        }} />

        <Stack.Screen name="minhas-checklists" options={{ title: 'Minhas Checklists' }} />

        <Stack.Screen name="menu-modelos" options={{
          title: 'Modelos', headerRight: () => (
            <View className="flex flex-row gap-8">
              {isConnected && <FontAwesome5 onPress={() => updateLocalDatabase().then(() => ToastAndroid.show("Atualizado com sucesso!", ToastAndroid.SHORT))} name="sync-alt" size={20} color="#fff" />}
              <Pressable
                onPress={logout}
                style={{ marginRight: 10 }}
              >
                <Text className='text-white'>sair</Text>
              </Pressable>
            </View>
          )
        }} />

        <Stack.Screen name="form-checklist" options={{ title: 'Formulário de Checklist' }} />

        <Stack.Screen name="menu-principal" options={{
          title: 'Menu Principal', headerBackVisible: false, headerRight: () => (
            <View className="flex flex-row gap-8">
              {isConnected && <FontAwesome5 onPress={() => updateLocalDatabase().then(() => ToastAndroid.show("Atualizado com sucesso!", ToastAndroid.SHORT))} name="sync-alt" size={20} color="#fff" />}
              <Pressable
                onPress={logout}
                style={{ marginRight: 10 }}
              >
                <Text className='text-white'>sair</Text>
              </Pressable>
            </View>
          )
        }} />

        <Stack.Screen name="list-direito-recusa" options={{
          title: 'Direito de Recusa', headerRight: () => (
            <View className="flex flex-row gap-8">
              {isConnected && <FontAwesome5 onPress={() => updateLocalDatabase().then(() => ToastAndroid.show("Atualizado com sucesso!", ToastAndroid.SHORT))} name="sync-alt" size={20} color="#fff" />}
              <Pressable
                onPress={logout}
                style={{ marginRight: 10 }}
              >
                <Text className='text-white'>sair</Text>
              </Pressable>
            </View>
          )
        }} />

        <Stack.Screen name="form-direito-recusa" options={{
          title: 'Formulário', headerRight: () => (
            <View className="flex flex-row gap-8">
              {isConnected && <FontAwesome5 onPress={() => updateLocalDatabase().then(() => ToastAndroid.show("Atualizado com sucesso!", ToastAndroid.SHORT))} name="sync-alt" size={20} color="#fff" />}
              <Pressable
                onPress={logout}
                style={{ marginRight: 10 }}
              >
                <Text className='text-white'>sair</Text>
              </Pressable>
            </View>
          )
        }} />

        <Stack.Screen name="list-report-cliente" options={{
          title: 'Report Cliente', headerRight: () => (
            <View className="flex flex-row gap-8">
              {isConnected && <FontAwesome5 onPress={() => updateLocalDatabase().then(() => ToastAndroid.show("Atualizado com sucesso!", ToastAndroid.SHORT))} name="sync-alt" size={20} color="#fff" />}
              <Pressable
                onPress={logout}
                style={{ marginRight: 10 }}
              >
                <Text className='text-white'>sair</Text>
              </Pressable>
            </View>
          )
        }} />

        <Stack.Screen name="form-report-cliente" options={{
          title: 'Formulário', headerRight: () => (
            <View className="flex flex-row gap-8">
              {isConnected && <FontAwesome5 onPress={() => updateLocalDatabase().then(() => ToastAndroid.show("Atualizado com sucesso!", ToastAndroid.SHORT))} name="sync-alt" size={20} color="#fff" />}
              <Pressable
                onPress={logout}
                style={{ marginRight: 10 }}
              >
                <Text className='text-white'>sair</Text>
              </Pressable>
            </View>
          )
        }} />

        <Stack.Screen name="form-condicao-insegura" options={{
          title: 'Condição Insegura', headerRight: () => (
            <View className="flex flex-row gap-8">
              {isConnected && <FontAwesome5 onPress={() => updateLocalDatabase().then(() => ToastAndroid.show("Atualizado com sucesso!", ToastAndroid.SHORT))} name="sync-alt" size={20} color="#fff" />}
              <Pressable
                onPress={logout}
                style={{ marginRight: 10 }}
              >
                <Text className='text-white'>sair</Text>
              </Pressable>
            </View>
          )
        }} />

        <Stack.Screen name="list-condicao-insegura" options={{
          title: 'Condição Insegura', headerRight: () => (
            <View className="flex flex-row gap-8">
              {isConnected && <FontAwesome5 onPress={() => updateLocalDatabase().then(() => ToastAndroid.show("Atualizado com sucesso!", ToastAndroid.SHORT))} name="sync-alt" size={20} color="#fff" />}
              <Pressable
                onPress={logout}
                style={{ marginRight: 10 }}
              >
                <Text className='text-white'>sair</Text>
              </Pressable>
            </View>
          )
        }} />

      </Stack>
    </SafeAreaProvider>
  );
}