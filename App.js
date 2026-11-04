import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation';
import { AppDataProvider } from './src/state/AppData';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <AppDataProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AppDataProvider>
    </GestureHandlerRootView>
  );
}
