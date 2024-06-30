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
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to let you pick a profile photo.');
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
    if (loading) return;

    if (!name || !phoneNumber || !email || !roomNumber || !password || !confirmPassword) {
      Alert.alert('Registration Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      let photoURL = null;
      if (profilePhoto) {
        try {
          photoURL = await uploadImage(profilePhoto, user.uid);
        } catch (uploadError) {
          console.error('Error uploading profile photo:', uploadError);
        }
      }

      await setDoc(doc(db, "users", user.uid), {
        name,
        phoneNumber,
        email,
        roomNumber,
        photoURL,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.push('/verification') }
      ]);
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please use a different email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  interface InputFieldProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  }
  
  const InputField: React.FC<InputFieldProps> = ({ 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false, 
    keyboardType = 'default' 
  }) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? "#888" : "#666"}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.innerContainer, 
              isDarkMode ? styles.darkContainer : styles.lightContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
              Create Account
            </Text>
            
            <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={[styles.photoPlaceholder, isDarkMode ? styles.darkPhotoPlaceholder : styles.lightPhotoPlaceholder]}>
                  <Ionicons name="camera" size={40} color={isDarkMode ? "#fff" : "#000"} />
                </View>
              )}
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Full Name"
              placeholderTextColor={isDarkMode ? "#888" : "#666"}
              value={name}
              onChangeText={setName}
              blurOnSubmit={false}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Phone Number"
              placeholderTextColor={isDarkMode ? "#888" : "#666"}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              blurOnSubmit={false}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Email"
              placeholderTextColor={isDarkMode ? "#888" : "#666"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              blurOnSubmit={false}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Room Number"
              placeholderTextColor={isDarkMode ? "#888" : "#666"}
              value={roomNumber}
              onChangeText={setRoomNumber}
              blurOnSubmit={false}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Password"
              placeholderTextColor={isDarkMode ? "#888" : "#666"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              blurOnSubmit={false}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Confirm Password"
              placeholderTextColor={isDarkMode ? "#888" : "#666"}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              blurOnSubmit={false}
            />
            
            <TouchableOpacity 
              style={[styles.button, loading ? styles.disabledButton : (isDarkMode ? styles.darkButton : styles.lightButton)]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={[styles.loginText, isDarkMode ? styles.darkText : styles.lightText]}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  lightInput: {
    backgroundColor: '#ffffff',
    borderColor: '#ccc',
    color: '#000',
  },
  darkInput: {
    backgroundColor: '#0A0A0A',
    borderColor: '#555',
    color: '#fff',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  lightButton: {
    backgroundColor: '#9C24FF',
  },
  darkButton: {
    backgroundColor: '#C57EFF',
  },
  disabledButton: {
    backgroundColor: '#888',
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
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  lightPhotoPlaceholder: {
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  darkPhotoPlaceholder: {
    borderColor: '#555',
    backgroundColor: '#333',
  },
  loginText: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default RegisterScreen;