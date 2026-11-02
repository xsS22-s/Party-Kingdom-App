import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation';
import { AppDataProvider } from './src/state/AppData';

export default function App() {
  return (
    <AppDataProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AppDataProvider>
  );
}
