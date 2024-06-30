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
  ActivityIndicator,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  }, [fadeAnim]);

  const handleLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      Alert.alert('Login Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await AsyncStorage.setItem('userToken', user.uid);
      console.log('User logged in successfully');
      router.push('/home');
    } catch (error: any) {
      let errorMessage = 'Invalid email or password. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email. Please check your email or register.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      }
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Not Active', 'Coming Soon in next Update. Contact Admin if you forgot your password for now!');
  };

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
            <Ionicons 
              name="log-in-outline" 
              size={80} 
              color={isDarkMode ? "#C57EFF" : "#9C24FF"} 
              style={styles.icon}
            />
            
            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
              Welcome Back
            </Text>
            
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
              placeholder="Password"
              placeholderTextColor={isDarkMode ? "#888" : "#666"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity 
              style={[styles.button, loading ? styles.disabledButton : (isDarkMode ? styles.darkButton : styles.lightButton)]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={[styles.forgotPassword, isDarkMode ? styles.darkText : styles.lightText]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={[styles.registerText, isDarkMode ? styles.darkText : styles.lightText]}>
                Don't have an account? Register
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
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
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
  forgotPassword: {
    fontSize: 16,
    marginTop: 15,
  },
  registerText: {
    marginTop: 20,
    fontSize: 16,
  },
  lightText: {
    color: '#000000',
  },
  darkText: {
    color: '#ffffff',
  },
});

export default LoginScreen;