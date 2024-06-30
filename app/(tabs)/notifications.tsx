import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, useColorScheme, TouchableOpacity, Alert } from 'react-native';
import { collection, query, orderBy, onSnapshot, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

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
    headerBackground: '#F2F2F7',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000',
    itemBackground: '#0A0A0A',
    itemBorder: '#444444',
    timestamp: '#aaa',
    headerBackground: '#1C1C1E',
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
      "Clear Notifications",
      "Are you sure you want to clear all notifications? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear", 
          style: "destructive",
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
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BlurView intensity={30} style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={clearAllNotifications}>
          <Ionicons name="trash-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </BlurView>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={50} color={colors.timestamp} />
            <Text style={[styles.emptyStateText, { color: colors.timestamp }]}>No notifications</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View key={item.id} style={[styles.notificationItem, { backgroundColor: colors.itemBackground, borderColor: colors.itemBorder }]}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} style={styles.notificationIcon} />
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationMessage, { color: colors.text }]}>{item.message}</Text>
                <Text style={[styles.timestamp, { color: colors.timestamp }]}>{item.timestamp.toLocaleString()}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 18,
  },
});

export default NotificationsScreen;