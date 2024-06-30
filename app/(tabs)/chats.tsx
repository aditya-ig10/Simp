import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, useColorScheme, Modal, Dimensions, Alert, ActivityIndicator, ViewStyle } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, storage } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useUserData } from '../../hooks/useUserData';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
type BubbleStyle = ViewStyle & {
    alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'auto' | 'stretch';
  };
interface User {
  name: string;
  phoneNumber: string;
  roomNumber: string;
  photoURL?: string;
}

interface Message {
    _id: string;
    createdAt: Date;
    text?: string;
    image?: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  interface EnlargedImageModalProps {
    imageUrl: string | null;
    onClose: () => void;
  }
  
  const EnlargedImageModal: React.FC<EnlargedImageModalProps> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
  
    return (
      <Modal
        transparent={true}
        visible={!!imageUrl}
        onRequestClose={onClose}
      >
        <TouchableOpacity 
          style={styles.enlargedImageOverlay} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.enlargedImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    );
  };
  const theme = {
    background: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    senderBubble: colorScheme === 'dark' ? '#4d4dff' : '#4d4dff',
    receiverBubble: colorScheme === 'dark' ? '#303030' : '#E4E6EB',
    inputBackground: colorScheme === 'dark' ? '#303030' : '#F0F2F5',
    lightText: colorScheme === 'dark' ? '#888888' : '#999999',
    headerBackground: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
    sendButton: colorScheme === 'dark' ? '#1C1C1E' : '#F0F2F5',
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
            image: doc.data().image,
            user: doc.data().user,
          }))
        );
      });

      return () => unsubscribe();
    }
  }, [loading, userData]);
  type RenderItemProps = {
    item: Message;
    index: number;
  };
  const onSend = async () => {
    if (inputMessage.trim().length > 0 && auth.currentUser && userData) {
      setIsLoading(true);
      try {
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
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send the message. Please try again.');
      } finally {
        setIsLoading(false);
      }
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled && result.assets[0].uri) {
      setIsLoading(true);
      try {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `images/${new Date().getTime()}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
    
        if (auth.currentUser && userData) {
          await addDoc(collection(db, 'messages'), {
            image: downloadURL,
            createdAt: serverTimestamp(),
            user: {
              _id: auth.currentUser.uid,
              name: userData.name,
              photoURL: userData.photoURL,
            },
          });
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload the image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderItem = ({ item, index }: RenderItemProps) => {
    const isMyMessage = item.user._id === auth.currentUser?.uid;
    const showAvatar = !isMyMessage && (index === messages.length - 1 || messages[index + 1].user._id !== item.user._id);
    const isLastInSequence = index === 0 || messages[index - 1].user._id !== item.user._id;
    const isFirstInSequence = index === messages.length - 1 || messages[index + 1].user._id !== item.user._id;
    const isMiddleMessage = !isFirstInSequence && !isLastInSequence;
  
    const bubbleStyle: BubbleStyle = {
      ...styles.messageBubble,
      ...(isMyMessage ? styles.senderBubble : styles.receiverBubble),
      ...(isFirstInSequence && (isMyMessage ? styles.firstSenderBubble : styles.firstReceiverBubble)),
      ...(isLastInSequence && (isMyMessage ? styles.lastSenderBubble : styles.lastReceiverBubble)),
      ...(isMiddleMessage && (isMyMessage ? styles.middleSenderBubble : styles.middleReceiverBubble)),
      ...(item.image && styles.imageBubble),
      backgroundColor: isMyMessage ? theme.senderBubble : theme.receiverBubble,
    };
  
    const handleImagePress = () => {
      if (item.image) {
        setEnlargedImage(item.image);
      }
    };
  
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
            <View style={bubbleStyle}>
              {item.text && <Text style={[styles.messageText, { color: isMyMessage ? '#FFFFFF' : theme.text }]}>{item.text}</Text>}
              {item.image && (
                <TouchableOpacity onPress={handleImagePress}>
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.messageImage} 
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              <Text style={[styles.timestamp, { color: isMyMessage ? 'rgba(255,255,255,0.7)' : theme.lightText }]}>
                {/* {formatTimestamp(item.createdAt)} */}
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
  renderItem={renderItem}
  keyExtractor={(item) => item._id}
  inverted
  initialNumToRender={15}
  maxToRenderPerBatch={10}
  windowSize={10}
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
        <TouchableOpacity onPress={pickImage} style={styles.ImagesendButton} disabled={isLoading}>
          <Ionicons name="attach" size={24} color="#ffff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSend} style={styles.sendButton} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="send" size={24} color="#ffff" />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
      {selectedUserId && (
        <UserProfile
          visible={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
        />
      )}
      <EnlargedImageModal
      imageUrl={enlargedImage}
      onClose={() => setEnlargedImage(null)}
    />
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
    marginBottom: 2,
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
    fontSize: 0,
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
  imageBubble: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: "ffffff",
  },
  messageImage: {
    width: 220,
    height: 220,
    borderRadius: 20,
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    zIndex: 1,
  },
  bubblestyle: {
    margin: 10,
  },
  senderBubble: {
    alignSelf: 'flex-end',
  } as BubbleStyle,
  receiverBubble: {
    alignSelf: 'flex-start',
  } as BubbleStyle,
  firstSenderBubble: {
    borderTopRightRadius: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 14,
  },
  lastSenderBubble: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  middleSenderBubble: {
    borderTopRightRadius: 14,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 14,
  },
  firstReceiverBubble: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 20,
  },
  lastReceiverBubble: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  middleReceiverBubble: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 20,
  },
  messageText: {
    fontSize: 16,
    flexWrap: 'wrap',
  },
  timestamp: {
    fontSize: 0,
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
    backgroundColor: '#4d4dff',
    borderRadius: 40,
    // marginRight: 10,
  },
  ImagesendButton: {
    padding: 10,
    backgroundColor: '#4d4dff',
    borderRadius: 40,
    marginRight: 10,
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
    marginBottom: 10,
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
    marginTop: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  enlargedImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: {
    width: '90%',
    height: '90%',
  },
});

export default Chats;