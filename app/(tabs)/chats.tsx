import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, useColorScheme, Modal, Dimensions, Alert } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useUserData } from '../../hooks/useUserData';

interface User {
  name: string;
  phoneNumber: string;
  roomNumber: string;
  photoURL?: string;
}

interface Message {
  _id: string;
  createdAt: Date;
  text: string;
  user: {
    _id: string;
    name: string;
    photoURL?: string;
  };
}

interface UserProfileProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ visible, onClose, userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const colorScheme = useColorScheme();
  const theme = {
    background: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    lightText: colorScheme === 'dark' ? '#888888' : '#999999',
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      }
    };
    if (visible) {
      fetchUserData();
    }
  }, [visible, userId]);

  if (!user) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.background }]}>
          <Image
            source={{ uri: user.photoURL || 'https://via.placeholder.com/100' }}
            style={styles.modalAvatar}
          />
          <Text style={[styles.modalText, { color: theme.text }]}>{user.name}</Text>
          <Text style={[styles.modalText, { color: theme.lightText }]}>Room: {user.roomNumber}</Text>
          <Text style={[styles.modalText, { color: theme.lightText }]}>Phone: {user.phoneNumber}</Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
          >
            <Text style={styles.textStyle}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const Chats = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const { userData, loading } = useUserData();
  const colorScheme = useColorScheme();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const theme = {
    background: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    senderBubble: colorScheme === 'dark' ? '#0084FF' : '#0084FF',
    receiverBubble: colorScheme === 'dark' ? '#303030' : '#E4E6EB',
    inputBackground: colorScheme === 'dark' ? '#303030' : '#F0F2F5',
    lightText: colorScheme === 'dark' ? '#888888' : '#999999',
    headerBackground: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
  };

  useEffect(() => {
    if (!loading && userData) {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            _id: doc.id,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            text: doc.data().text,
            user: doc.data().user,
          }))
        );
      });

      return () => unsubscribe();
    }
  }, [loading, userData]);

  const onSend = async () => {
    if (inputMessage.trim().length > 0 && auth.currentUser && userData) {
      await addDoc(collection(db, 'messages'), {
        text: inputMessage,
        createdAt: serverTimestamp(),
        user: {
          _id: auth.currentUser.uid,
          name: userData.name,
          photoURL: userData.photoURL,
        },
      });
      setInputMessage('');
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const deleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      Alert.alert('Error', 'Failed to delete the message. Please try again.');
    }
  };

  const handleLongPress = (item: Message) => {
    if (item.user._id === auth.currentUser?.uid) {
      Alert.alert(
        'Delete Message',
        'Are you sure you want to delete this message for everyone?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: () => deleteMessage(item._id), style: 'destructive' },
        ]
      );
    }
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.user._id === auth.currentUser?.uid;
    const showAvatar = !isMyMessage && (index === messages.length - 1 || messages[index + 1].user._id !== item.user._id);
    const isLastInSequence = index === 0 || messages[index - 1].user._id !== item.user._id;
    const isFirstInSequence = index === messages.length - 1 || messages[index + 1].user._id !== item.user._id;
    const isMiddleMessage = !isFirstInSequence && !isLastInSequence;

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        <View style={styles.messageContainer}>
          {!isMyMessage && (
            <View style={styles.avatarContainer}>
              {showAvatar ? (
                <TouchableOpacity onPress={() => setSelectedUserId(item.user._id)}>
                  <Image
                    source={{ uri: item.user.photoURL || 'https://via.placeholder.com/40' }}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>
          )}
          <View style={[styles.messageContent, isMyMessage && styles.myMessageContent]}>
            {!isMyMessage && showAvatar && (
              <Text style={[styles.senderName, { color: theme.lightText }]}>{item.user.name}</Text>
            )}
            <View style={[
              styles.messageBubble,
              isMyMessage ? [styles.senderBubble, { backgroundColor: theme.senderBubble }] : [styles.receiverBubble, { backgroundColor: theme.receiverBubble }],
              isFirstInSequence && (isMyMessage ? styles.firstSenderBubble : styles.firstReceiverBubble),
              isLastInSequence && (isMyMessage ? styles.lastSenderBubble : styles.lastReceiverBubble),
              isMiddleMessage && (isMyMessage ? styles.middleSenderBubble : styles.middleReceiverBubble),
            ]}>
              <Text style={[styles.messageText, { color: isMyMessage ? '#FFFFFF' : theme.text }]}>{item.text}</Text>
              <Text style={[styles.timestamp, { color: isMyMessage ? 'rgba(255,255,255,0.7)' : theme.lightText }]}>
                {formatTimestamp(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <Text style={[styles.title, { color: theme.text }]}>Global Chat</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={({ item, index }) => renderItem({ item, index })}
        keyExtractor={(item) => item._id}
        inverted
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
        style={[styles.inputContainer, { backgroundColor: theme.background }]}
      >
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground }]}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Write a message..."
          placeholderTextColor={theme.lightText}
        />
        <TouchableOpacity onPress={onSend} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#0084FF" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
      {selectedUserId && (
        <UserProfile
          visible={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
        />
      )}
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    marginHorizontal: 10,
    alignItems: 'flex-end',
  },
  avatarContainer: {
    width: 40,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageContent: {
    flex: 1,
  },
  myMessageContent: {
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 12,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    maxWidth: windowWidth * 0.7,
  },
  senderBubble: {
    alignSelf: 'flex-end',
  },
  receiverBubble: {
    alignSelf: 'flex-start',
  },
  firstSenderBubble: {
    borderTopRightRadius: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  lastSenderBubble: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4,
  },
  middleSenderBubble: {
    borderTopRightRadius: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4,
  },
  firstReceiverBubble: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  lastReceiverBubble: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 20,
  },
  middleReceiverBubble: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 20,
  },
  messageText: {
    fontSize: 16,
    flexWrap: 'wrap',
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    padding: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Chats;