import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Image, TextInput, useColorScheme, Modal, Linking, FlatList } from 'react-native';
import { collection, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useUserData } from '../../hooks/useUserData';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ImageSourcePropType } from 'react-native';

interface Item {
  name: string;
  image: ImageSourcePropType;
}

const items: Item[] = [
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

interface ColorTheme {
  text: string;
  subtext: string;
  background: string;
  searchBar: string;
  itemBorder: string;
  itemBackground: string;
  placeholderText: string;
}

const colorTheme: { light: ColorTheme; dark: ColorTheme } = {
  light: {
    text: '#333333',
    subtext: '#666666',
    background: '#FFFFFF',
    searchBar: '#EEEEEE',
    itemBorder: '#DDDDDD',
    itemBackground: '#F5F5F5',
    placeholderText: '#999999',
  },
  dark: {
    text: '#FFFFFF',
    subtext: '#D0D0D0',
    background: '#000000',
    searchBar: '#262626',
    itemBorder: '#444444',
    itemBackground: '#1C1C1E',
    placeholderText: '#666666',
  },
};

const ItemSeparator = () => <View style={styles.separator} />;

interface RenderItemProps {
  item: Item;
  onPress: (itemName: string) => void;
  colors: ColorTheme;
}

const RenderItem: React.FC<RenderItemProps> = React.memo(({ item, onPress, colors }) => (
  <View style={[styles.itemContainer, { backgroundColor: colors.itemBackground }]}>
    <Image source={item.image} style={styles.itemImage} />
    <View style={styles.itemDetails}>
      <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
      <TouchableOpacity 
        style={styles.requestButton} 
        onPress={() => onPress(item.name)}
      >
        <Text style={styles.requestButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
));

const Home: React.FC = () => {
  const { userData, loading: userLoading, loading: userError } = useUserData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorTheme[colorScheme || 'light'];


  useEffect(() => {
    console.log('Home component mounted');
    console.log('User loading:', userLoading);
    console.log('Current user:', auth.currentUser?.uid);
  }, [userLoading, userData]);

  useEffect(() => {
    const unsubscribeNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const hasNew = snapshot.docChanges().some(change => change.type === 'added' && change.doc.data().userId !== auth.currentUser?.uid);
      if (hasNew) {
        setHasNewNotification(true);
      }
    });
  
    const unsubscribeMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
      const hasNew = snapshot.docChanges().some(change => change.type === 'added' && change.doc.data().userId !== auth.currentUser?.uid);
      if (hasNew) {
        setHasNewMessage(true);
      }
    });
  
    return () => {
      unsubscribeNotifications();
      unsubscribeMessages();
    };
  }, []);

  const handleNotificationPress = () => {
    setHasNewNotification(false);
    router.push('/notifications');
  };
  
  const handleGlobalChat = () => {
    setHasNewMessage(false);
    router.push('/chats');
  };

  const handleProfile = () => {
    setHasNewMessage(false);
    router.push('/profile');
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
      setHasNewNotification(true);
      Alert.alert('Success', `Request for ${itemName} sent successfully!`);
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send request.');
    }
  };

  const filteredItems: Item[] = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = useCallback(({ item }: { item: Item }) => (
    <RenderItem item={item} onPress={sendNotification} colors={colors} />
  ), [colors, sendNotification]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: 150,
    offset: 150 * index,
    index,
  }), []);

  // const filteredItems: Item[] = items.filter(item =>
  //   item.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

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
        <TouchableOpacity onPress={handleProfile} style={styles.userInfo}>
          {userData.photoURL ? (
            <Image 
              source={{ uri: userData.photoURL }} 
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Text style={styles.defaultAvatarText}>{userData.name[0]}</Text>
            </View>
          )}
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>Have a great day 👋</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{userData.name}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={handleNotificationPress} style={styles.iconWrapper}>
            <Ionicons 
              name="notifications-outline" 
              size={24} 
              color={colors.text} 
            />
            {hasNewNotification && <View style={styles.notificationDot} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGlobalChat} style={styles.iconWrapper}>
            <Ionicons 
              name="chatbubble-ellipses-outline" 
              size={24} 
              color={colors.text} 
            />
            {hasNewMessage && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.main}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome to SimpApp</Text>
        <Text style={[styles.subText, { color: colors.subtext }]}>Browse and request items you need from your hostel mates!</Text>
        <View style={[styles.searchBarContainer, { backgroundColor: colors.searchBar }]}>
          <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchBar, { color: colors.text }]}
            placeholder="Search items..."
            placeholderTextColor={colors.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Text style={[styles.sub, { color: colors.text, marginTop: 10 }]}>Item List</Text>
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ItemSeparatorComponent={ItemSeparator}
          getItemLayout={getItemLayout}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
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
    marginBottom: 20,
  },
  separator: {
    height: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: '48%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  requestButton: {
    backgroundColor: '#4d4dff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  defaultAvatar: {
    backgroundColor: '#9C24FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sub: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subText: {
    fontSize: 15,
    marginBottom: 20,
    marginTop: 5,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconWrapper: {
    padding: 5,
    marginLeft: 10,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  icon: {
    padding: 5,
    marginLeft: 10,
  },
  main: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },

  button: {
    backgroundColor: '#4d4dff',
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