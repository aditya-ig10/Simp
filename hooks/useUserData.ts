import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

interface UserData {
  name: string;
  phoneNumber: string;
  email: string;
  roomNumber: string;
  // Add any other fields you're storing
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('useUserData effect running');
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDoc, async (doc) => {
          console.log('User document snapshot received');
          if (doc.exists()) {
            const userData = doc.data() as UserData;
            setUserData(userData);
            
            // Check if user is admin
            try {
              const adminsCollection = collection(db, 'admins');
              const adminDocs = await getDocs(adminsCollection);
              const adminEmails = adminDocs.docs.map(doc => doc.id);
              setIsAdmin(adminEmails.includes(userData.email));
            } catch (error) {
              console.error('Error checking admin status:', error);
              // Set isAdmin to false if there's an error
              setIsAdmin(false);
            }
          } else {
            setUserData(null);
            setIsAdmin(false);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching user data:', error);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUserData(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  console.log('useUserData state:', { userData, loading, isAdmin });

  return { userData, loading, isAdmin };
};