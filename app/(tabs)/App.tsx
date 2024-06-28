// App.tsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Image, TextInput, useColorScheme, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { usePersistedAuth } from '../../hooks/usePersistedAuth';
import Home from './home';
import Login from './login';

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

const Stack = createStackNavigator();

export default function App() {
  const { user, initializing } = usePersistedAuth();

  if (initializing) {
    // Return a loading screen here
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="Home" component={Home} />
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}