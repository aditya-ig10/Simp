import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

const IndexScreen: React.FC = () => {
  const [isChecked, setIsChecked] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();

  const isDarkMode = colorScheme === 'dark';

  const handleContinue = () => {
    if (isChecked) {
      router.push('/ask');
    } else {
      console.log('Please agree to the terms and conditions');
      // You might want to show an alert or some feedback to the user here
    }
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Text style={[styles.heading, isDarkMode ? styles.darkText : styles.lightText]}>SimpApp</Text>
      <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Welcome to SimpApp</Text>
      <Text style={[styles.para, isDarkMode ? styles.darkText : styles.lightText]}>SimpApp is a very simple app that helps user to send generic notification when a 
        user needs a particular item or a thing, he can request for an item by clicking an item that will notify all the users of app that he needs something!
      </Text>
      
      <View style={styles.switchContainer}>
        <Switch
          value={isChecked}
          onValueChange={setIsChecked}
        />
        <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>
          I agree to the terms and conditions!
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} 
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  lightContainer: {
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
  },

  para: {
    fontSize: 16,
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    marginLeft: 8,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    color: '#ffffff',
  },
  lightButton: {
    backgroundColor: '#9C24FF',
  },
  darkButton: {
    backgroundColor: '#C57EFF',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lightText: {
    color: '#000000',
  },
  darkText: {
    color: '#ffffff',
  },
});

export default IndexScreen;