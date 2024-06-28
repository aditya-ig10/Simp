import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
}

const colorTheme = {
  light: {
    text: '#333333',
    background: '#FFFFFF',
    itemBackground: '#f0f0f0',
    itemBorder: '#DDDDDD',
    timestamp: '#888',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000',
    itemBackground: '#262626',
    itemBorder: '#444444',
    timestamp: '#aaa',
  },
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = colorTheme[colorScheme || 'light'];

  useEffect(() => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList: Notification[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date() // Provide a fallback date
      } as Notification));
      
      setNotifications(notificationsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.text} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.map((item) => (
          <View key={item.id} style={[styles.notificationItem, { backgroundColor: colors.itemBackground, borderColor: colors.itemBorder }]}>
            <Text style={{ color: colors.text }}>{item.message}</Text>
            <Text style={[styles.timestamp, { color: colors.timestamp }]}>{item.timestamp.toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50, 
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notificationItem: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default NotificationsScreen;