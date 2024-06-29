import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme, 
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
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

    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, [fadeAnim]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string, uid: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profilePhotos/${uid}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      let photoURL = null;
      if (profilePhoto) {
        photoURL = await uploadImage(profilePhoto, user.uid);
      }
  
      // Store user data in Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
          name,
          phoneNumber,
          email,
          roomNumber,
          photoURL,
          // Add any other fields you want to store
        });
        console.log('User registered and data stored successfully');
        // Navigate to the email verification or home screen
        router.push('/verification');
      } catch (firestoreError: any) {
        console.error('Error storing user data:', firestoreError);
        Alert.alert('Registration Error', 'User account created, but there was an error storing additional data. Please contact support.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.innerContainer, 
          isDarkMode ? styles.darkContainer : styles.lightContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
          Register
        </Text>

        <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
          ) : (
            <View style={[styles.photoPlaceholder, isDarkMode ? styles.darkPhotoPlaceholder : styles.lightPhotoPlaceholder]}>
              <Text style={[styles.photoPlaceholderText, isDarkMode ? styles.darkText : styles.lightText]}>
                Add Photo
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          placeholder="Name"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          placeholder="Phone Number"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          placeholder="Email"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          placeholder="Room Number"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={roomNumber}
          onChangeText={setRoomNumber}
        />
        
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} 
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  lightInput: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
    color: '#000',
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  button: {
    width: '100%',
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
  lightText: {
    color: '#000000',
  },
  darkText: {
    color: '#ffffff',
  },
  photoContainer: {
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  lightPhotoPlaceholder: {
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  darkPhotoPlaceholder: {
    borderColor: '#555',
    backgroundColor: '#333',
  },
  photoPlaceholderText: {
    fontSize: 14,
  },
});

export default RegisterScreen;