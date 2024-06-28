import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, useColorScheme, TouchableOpacity, Alert } from 'react-native';
import { collection, query, orderBy, onSnapshot, doc, writeBatch } from 'firebase/firestore';
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
        timestamp: doc.data().timestamp?.toDate() || new Date() 
      } as Notification));
      
      setNotifications(notificationsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAllNotifications = async () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "OK", 
          onPress: async () => {
            setLoading(true);
            const batch = writeBatch(db);
            notifications.forEach((notification) => {
              const notificationRef = doc(db, 'notifications', notification.id);
              batch.delete(notificationRef);
            });
            
            try {
              await batch.commit();
              setNotifications([]);
            } catch (error) {
              console.error("Error clearing notifications: ", error);
              Alert.alert("Error", "Failed to clear notifications. Please try again.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.text} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity 
          style={[styles.clearButton, { backgroundColor: colors.itemBackground }]} 
          onPress={clearAllNotifications}
        >
          <Text style={{ color: colors.text }}>Clear All</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButton: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
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