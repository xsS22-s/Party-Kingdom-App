import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import BookScreen from '../screens/BookScreen';
import WaiverScreen from '../screens/WaiverScreen';
import OpenJumpScreen from '../screens/OpenJumpScreen';
import UltimateBashScreen from '../screens/UltimateBashScreen';
import TeamPartiesScreen from '../screens/TeamPartiesScreen';
import FieldTripsScreen from '../screens/FieldTripsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = { Home: '🏠', Book: '🎟️', Waiver: '📜' };

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.royal,
        tabBarInactiveTintColor: '#A99BD1',
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '800' },
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Book" component={BookScreen} options={{ title: 'Book' }} />
      <Tab.Screen name="Waiver" component={WaiverScreen} />
    </Tab.Navigator>
  );
}

// Detail screens (Open Jump, Ultimate Bash, Team Parties, Field Trips) live
// in the root stack rather than the tab bar, matching the prototype: they're
// one level deep from Home via the "Explore the Kingdom" carousel, with a
// back arrow rather than being permanent tabs.
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen name="OpenJump" component={OpenJumpScreen} />
        <Stack.Screen name="UltimateBash" component={UltimateBashScreen} />
        <Stack.Screen name="TeamParties" component={TeamPartiesScreen} />
        <Stack.Screen name="FieldTrips" component={FieldTripsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
