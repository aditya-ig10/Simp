import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Image, TextInput, useColorScheme, ScrollView } from 'react-native';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useUserData } from '../../hooks/useUserData';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const items = [
  { name: 'Maggie', image: require('../../assets/maggie.webp') },
  { name: 'Coffee', image: require('../../assets/coffee.jpg') },
  { name: 'Amul Milk', image: require('../../assets/milk.jpg') },
  { name: 'Amul Milk', image: require('../../assets/milk.jpg') },
  { name: 'Amul Milk', image: require('../../assets/milk.jpg') },
  { name: 'Amul Milk', image: require('../../assets/milk.jpg') },
];

const colorTheme = {
  light: {
    text: '#333333',
    background: '#FFFFFF',
    searchBar: '#EEEEEE',
    itemBorder: '#DDDDDD',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000',
    searchBar: '#262626',
    itemBorder: '#444444',
  },
};

const Home = () => {
  const { userData, loading: userLoading, isAdmin: userError } = useUserData();
  const [message, setMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorTheme[colorScheme || 'light'];

  useEffect(() => {
    console.log('Home component mounted');
    console.log('User loading:', userLoading);
    console.log('Current user:', auth.currentUser?.uid);
  }, [userLoading, userData]);

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Implement logout functionality here');
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
  

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userLoading) {
    return <ActivityIndicator size="large" color={colors.text} />;
  }

  if (userError) {
    return <Text style={[styles.errorText, { color: colors.text }]}>Error: {userError}</Text>;
  }

  if (!userData) {
    return <Text style={[styles.errorText, { color: colors.text }]}>User not found</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Hello {userData.name},</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={handleNotificationPress} style={styles.icon}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.icon}>
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.main}>
        <Text style={[styles.sub, { color: colors.text }]}>Welcome to SimpApp</Text>
        <TextInput
          style={[styles.searchBar, { backgroundColor: colors.searchBar, color: colors.text }]}
          placeholder="Search items..."
          placeholderTextColor={colors.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredItems.map((item, index) => (
            <View key={index} style={[styles.itemContainer, { borderColor: colors.itemBorder }]}>
              <View style={styles.itemInfo}>
                <Image source={item.image} style={styles.itemImage} />
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
              </View>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => sendNotification(item.name)}
              >
                <Text style={styles.buttonText}>Request this item</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sub: {
    fontSize: 17,
    marginBottom: 20,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    padding: 5,
    marginLeft: 10,
  },
  main: {
    flex: 1,
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
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
    borderRadius: 50,
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
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Home;