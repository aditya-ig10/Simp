import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Image, TextInput, useColorScheme, ScrollView, Modal, Linking } from 'react-native';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useUserData } from '../../hooks/useUserData';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const items = [
  { name: 'Maggie', image: require('../../assets/maggie.webp') },
  { name: 'Coffee', image: require('../../assets/coffee.jpg') },
  { name: 'Amul Milk', image: require('../../assets/milk.jpg') },
  { name: 'Milk Powder', image: require('../../assets/milk_pow.jpg') },
  { name: 'Namkeen', image: require('../../assets/namkeen.jpeg') },
  { name: 'Biscuits', image: require('../../assets/biscuit.jpg') },
  { name: 'Iron', image: require('../../assets/iron.jpg') },
  { name: 'Kettle', image: require('../../assets/kettle.webp') },
  { name: 'Induction', image: require('../../assets/induction.webp') },
  { name: 'Mixer', image: require('../../assets/mixer.jpg') },
  { name: 'Heater', image: require('../../assets/heater.jpg') },
  { name: 'Immersion Rod', image: require('../../assets/imrod.webp') },
  { name: 'Bulb', image: require('../../assets/bulb.webp') },
  { name: 'Charger', image: require('../../assets/chargerc.jpg') },
  { name: 'Charger (Lightning Port)', image: require('../../assets/lc.jpg') },
  { name: 'Wireless Charger', image: require('../../assets/wc.webp') },
  { name: 'Power Bank', image: require('../../assets/pb.jpg') },
  { name: 'TWS Earphones', image: require('../../assets/tws.jpg') },
  { name: 'Headphones', image: require('../../assets/hp.webp') },
  { name: 'Console Remote', image: require('../../assets/cr.jpg') },
  { name: 'Pen Drive', image: require('../../assets/pd.webp') },
  { name: 'OTG (Type C)', image: require('../../assets/otg.jpg') },
  { name: 'HDMI Cable', image: require('../../assets/hdmi.jpg') },
  { name: 'White Paper', image: require('../../assets/wp.jpg') },
  { name: 'Fevicol', image: require('../../assets/fc.jpeg') },
  { name: 'Scissors', image: require('../../assets/sc.webp') },
  { name: 'Soap', image: require('../../assets/soap.jpg') },
  { name: 'Shampoo', image: require('../../assets/shampoo.jpg') },
  { name: 'Dettol', image: require('../../assets/det.jpg') },
  { name: 'Pefume', image: require('../../assets/perf.webp') },
  { name: 'Hair Wax', image: require('../../assets/wax.jpg') },
  { name: 'Hair Oil', image: require('../../assets/oil.jpeg') },
  { name: 'Trimmer', image: require('../../assets/tr.jpg') },
  { name: 'Comb', image: require('../../assets/comb.jpg') },
  { name: 'Belt', image: require('../../assets/belt.jpg') },
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
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
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
    auth.signOut().then(() => router.push('/login'));
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const sendNotification = async (itemName: string) => {
    if (!userData) {
      Alert.alert('Error', 'User data not available');
      return;
    }

    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        message: `${userData.name} of Room: ${userData.roomNumber} and Phone Number: ${userData.phoneNumber}, has requested for ${itemName}`,
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
          <TouchableOpacity onPress={() => setInfoModalVisible(true)} style={styles.icon}>
            <Ionicons name="information-circle-outline" size={24} color={colors.text} />
          </TouchableOpacity>
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
      {isInfoModalVisible && (
        <BlurView
          style={StyleSheet.absoluteFill}
          intensity={20}
          tint={'systemUltraThinMaterial'}
        />
      )}
       <Modal
        animationType="slide"
        transparent={true}
        visible={isInfoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>About</Text>
            <Text style={[styles.modalText, { color: colors.text }]}>SimpApp- by Aditya</Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity onPress={() => openLink('https://github.com/aditya-ig10')} style={styles.socialIcon}>
                <Ionicons name="logo-github" size={30} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLink('https://www.linkedin.com/in/as0097')} style={styles.socialIcon}>
                <Ionicons name="logo-linkedin" size={30} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLink('https://instagram.com/xy_afk')} style={styles.socialIcon}>
                <Ionicons name="logo-instagram" size={30} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSub, { color: colors.text }]}>Hello Guys! Aditya this side and I hope tum logo ko app acha lag rha hoga, 
              I just want to inform ki app abhi bhi development me hai and further updates me as per your need mai features add kar dunga!
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: '#9C24FF' }]}
              onPress={() => setInfoModalVisible(false)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: '50%',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  modalText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 22,
  },
  modalSub: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  closeButton: {
    borderRadius: 10,
    padding: 10,
    width: 200,
    elevation: 2,
    marginTop: "15%",
  },
  textStyle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  socialIcon: {
    marginHorizontal: 10,
  },
});

export default Home;