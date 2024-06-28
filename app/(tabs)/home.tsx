import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useUserData } from '../../hooks/useUserData';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const items = [
  { name: 'Maggie', image: require('../../assets/maggie.webp') },
  { name: 'Coffee', image: require('../../assets/maggie.webp') },
  { name: 'Milk', image: require('../../assets/maggie.webp') },
];

const Home = () => {
  const { userData, loading: userLoading, isAdmin: userError } = useUserData();
  const [message, setMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('Home component mounted');
    console.log('User loading:', userLoading);
    console.log('Current user:', auth.currentUser?.uid);
  }, [userLoading, userData]);

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const sendNotification = async (itemName: string) => {
    if (!userData) {
      Alert.alert('Error', 'User data not available');
      return;
    }

    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        message: `${userData.name} of Room ${userData.roomNumber} has requested for ${itemName}`,
        timestamp: serverTimestamp(),
        userId: auth.currentUser?.uid
      });
      Alert.alert('Success', `Request for ${itemName} sent successfully!`);
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send request.');
    }
  };

  if (userLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (userError) {
    return <Text>Error: {userError}</Text>;
  }

  if (!userData) {
    return <Text>User not found</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Heyy {userData.name}</Text>
        <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationIcon}>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.main}>
        <Text>Hello from my firestore: {message}</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemInfo}>
              <Image source={item.image} style={styles.itemImage} />
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => sendNotification(item.name)}
            >
              <Text style={styles.buttonText}>Request this item</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationIcon: {
    padding: 5,
  },
  main: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#9C24FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;