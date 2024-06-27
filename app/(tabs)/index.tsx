import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const IndexScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>SimpApp</Text>
      <Text style={styles.title}>Welcome to SimpApp</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 22,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    marginLeft: 22,
    marginBottom: 220,
  },
  button: {
    
  }
});

export default IndexScreen;