import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  useColorScheme, 
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { BlurView } from 'expo-blur';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();

  const isDarkMode = colorScheme === 'dark';

  const theme = {
    background: isDarkMode ? '#000000' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    lightText: isDarkMode ? '#888888' : '#999999',
    headerBackground: isDarkMode ? '#1C1C1E' : '#F2F2F7',
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data());
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profilePhotos/${currentUser.uid}`);
      await uploadBytes(storageRef, blob);
      const photoURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", currentUser.uid), { photoURL });
      setUser({ ...user, photoURL });
    } catch (error) {
      console.error("Error updating profile photo:", error);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const MenuItem = ({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) => (
    <View style={styles.menuItem}>
      <Ionicons name={icon} size={24} color={theme.text} style={styles.menuIcon} />
      <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {user?.photoURL ? (
            <Image 
              source={{ uri: user.photoURL }} 
              style={styles.profilePhoto} 
            />
          ) : (
            <View style={[styles.profilePhoto, styles.defaultAvatar]}>
              <Text style={styles.defaultAvatarText}>{user?.name[0]}</Text>
            </View>
          )}
          <View style={styles.editIconContainer}>
            <Ionicons name="pencil" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: theme.text }]}>{user?.name}</Text>
          <Text style={[styles.email, { color: theme.lightText }]}>{user?.email}</Text>
        </View>

        <View style={styles.userInfoContainer}>
          <MenuItem icon="call-outline" label={user?.phoneNumber || 'Not set'} />
          <MenuItem icon="home-outline" label={`Room ${user?.roomNumber}` || 'Not set'} />
          <MenuItem icon="mail-outline" label={user?.email || 'Not set'} />
        </View>

        <View style={styles.menuContainer}>
          <MenuItem icon="people-outline" label="All users" />
          <TouchableOpacity onPress={() => setInfoModalVisible(true)}>
            <MenuItem icon="information-circle-outline" label="Information" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

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
          <View style={[styles.modalView, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>About</Text>
            <Text style={[styles.modalText, { color: theme.text }]}>SimpApp- by Aditya</Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity onPress={() => openLink('https://github.com/aditya-ig10')} style={styles.socialIcon}>
                <Ionicons name="logo-github" size={30} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLink('https://www.linkedin.com/in/as0097')} style={styles.socialIcon}>
                <Ionicons name="logo-linkedin" size={30} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLink('https://instagram.com/xy_afk')} style={styles.socialIcon}>
                <Ionicons name="logo-instagram" size={30} color={theme.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSub, { color: theme.text }]}>Hello Guys! Aditya this side and I hope tum logo ko app acha lag rha hoga, 
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  photoContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    backgroundColor: '#9C24FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4d4dff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
  },
  userInfoContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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

export default Profile;