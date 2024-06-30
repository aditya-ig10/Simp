import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme, 
  Animated,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendEmailVerification, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const EmailVerificationScreen: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

    const checkEmailVerification = async (user: User) => {
      await user.reload();
      setIsVerified(user.emailVerified);
      setIsLoading(false);
      if (user.emailVerified) {
        router.push('/home');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkEmailVerification(user);
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fadeAnim, router]);

  const handleSendVerificationEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
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
      Alert.alert('Error', 'No user is currently signed in.');
    }
  };

  const handleContinue = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        router.push('/home');
      } else {
        Alert.alert('Email Not Verified', 'Please verify your email before continuing.');
      }
    } else {
      Alert.alert('Error', 'No user is currently signed in.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#C57EFF' : '#9C24FF'} />
      </View>
    );
  }

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
          ? 'Your email has been verified! You can now proceed to the main app.' 
          : 'Please verify your email to continue. Check your inbox for a verification link.'}
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
        <Text style={styles.buttonText}>{isVerified ? 'Continue to App' : 'Check Verification Status'}</Text>
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
    backgroundColor: '#121212',
  },
  lightContainer: {
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
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