import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  useColorScheme, 
  Animated
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useUserData } from '../../hooks/useUserData';

const SomeComponent: React.FC = () => {
  const { userData, loading } = useUserData();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!userData) {
    return <Text>No user data available</Text>;
  }

  return (
    <View>
      <Text>Welcome, {userData.name}!</Text>
      <Text>Your room number: {userData.roomNumber}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lightContainer: {
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 40,
  },
  mainText: {
    fontSize: 28,
    fontWeight: '400',
  },
  lightText: {
    color: '#000000',
  },
  darkText: {
    color: '#ffffff',
  },
});

export default SomeComponent;
