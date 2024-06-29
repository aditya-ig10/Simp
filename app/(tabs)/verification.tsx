import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme, 
  Animated,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendEmailVerification, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const EmailVerificationScreen: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsVerified(user.emailVerified);
      }
    });

    return () => unsubscribe();
  }, [fadeAnim]);

  const handleSendVerificationEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        console.log('Verification email sent successfully');
        Alert.alert('Verification Email Sent', 'Please check your email inbox and spam folder.');
      } catch (error) {
        console.error('Error sending verification email:', error);
        if (error instanceof Error) {
          Alert.alert('Error', `Failed to send verification email: ${error.message}`);
        } else {
          Alert.alert('Error', 'An unknown error occurred while sending the verification email');
        }
      }
    } else {
      console.error('No user is currently signed in');
      Alert.alert('Error', 'No user is currently signed in.');
    }
  };

  const handleContinue = () => {
    if (isVerified) {
      // Navigate to the main app screen
      router.push('/home');
    } else {
      Alert.alert('Email Not Verified', 'Please verify your email before continuing or if you have verified please close the app and try logging in!');
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        isDarkMode ? styles.darkContainer : styles.lightContainer,
        { opacity: fadeAnim }
      ]}
    >
      <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
        Email Verification
      </Text>
      
      <Text style={[styles.message, isDarkMode ? styles.darkText : styles.lightText]}>
        {isVerified 
          ? 'Your email has been verified!' 
          : 'Please verify your email to continue, or you can proceed to login after verifying email.'}
      </Text>
      
      {!isVerified && (
        <TouchableOpacity 
          style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} 
          onPress={handleSendVerificationEmail}
        >
          <Text style={styles.buttonText}>Send Verification Email</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} 
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  lightContainer: {
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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
  darkText: {
    color: '#ffffff',
  },
  lightText: {
    color: '#000000',
  },
});

export default EmailVerificationScreen;