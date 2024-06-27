import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBv5a5VNaBaQuBrFpHqiuP2a1RpTeKXb9Y",
    authDomain: "simpapp-885ef.firebaseapp.com",
    projectId: "simpapp-885ef",
    storageBucket: "simpapp-885ef.appspot.com",
    messagingSenderId: "873279943758",
    appId: "1:873279943758:web:7a47bc7d6cb102dea47f1f",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
