import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { useRouter } from 'expo-router';

const AskScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleNewUser = () => {
    console.log('Navigating to new user registration');
    router.push('/register');
  };

  const handleExistingUser = () => {
    console.log('Navigating to login');
    router.push('/login');
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        isDarkMode ? styles.darkContainer : styles.lightContainer,
        { opacity: fadeAnim }
      ]}
    >
      <Text style={[styles.question, isDarkMode ? styles.darkText : styles.lightText]}>
        Are you a new user or do you already have an account?
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} 
        onPress={handleNewUser}
      >
        <Text style={styles.buttonText}>I'm a New User</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} 
        onPress={handleExistingUser}
      >
        <Text style={styles.buttonText}>I Have an Account</Text>
      </TouchableOpacity>
    </Animated.View>
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
  question: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  lightText: {
    color: '#000000',
  },
  darkText: {
    color: '#ffffff',
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  lightButton: {
    backgroundColor: '#9C24FF',
  },
  darkButton: {
    backgroundColor: '#C57EFF',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AskScreen;