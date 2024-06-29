import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

interface UserData {
  photoURL: string;
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
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDoc, async (doc) => {
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

  return { userData, loading, isAdmin };
};
