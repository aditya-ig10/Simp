import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';
import { User } from 'firebase/auth';

export const usePersistedAuth = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          // Instead of signing in with a custom token, we'll just check if the user is already signed in
          const currentUser = auth.currentUser;
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (e) {
        console.error(e);
      }

      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        if (initializing) setInitializing(false);
      });

      return unsubscribe;
    };

    bootstrapAsync();
  }, []);

  return { user, initializing };
};