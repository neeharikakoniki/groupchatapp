import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  ListRenderItem,
  Alert,
} from 'react-native';
import { db, auth } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import analytics from '@react-native-firebase/analytics';
import * as Keychain from 'react-native-keychain';

interface Message {
  id: string;
  text: string;
  createdAt?: { seconds: number };
  userId: string;
  userName: string | null;
}

type RootStackParamList = {
  Login: undefined;
  Chat: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ navigation }: Props) {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUserId = auth.currentUser?.uid;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="Logout"
          onPress={async () => {
            try {
              await Keychain.resetGenericPassword(); 
              await signOut(auth);
              navigation.replace('Login');
            } catch (err) {
              Alert.alert('Logout Error', (err as Error).message);
            }
          }}
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.text && data.text.trim() !== '') {
          msgs.push({ id: doc.id, ...(data as Omit<Message, 'id'>) });
        }
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (message.trim().length === 0) return;
    try {
      await addDoc(collection(db, 'messages'), {
        text: message,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.email || null,
      });

      await analytics().logEvent('message_sent', {
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.email,
        textLength: message.length,
      });

      setMessage('');
    } catch (error) {
      console.log('Error sending message: ', error);
    }
  };

  const formatTime = (timestamp?: { seconds: number }): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderItem: ListRenderItem<Message> = ({ item }) => {
    const isCurrentUser = item.userId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <View style={styles.messageHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        inverted
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  messageLeft: {
    alignSelf: 'flex-start',
    backgroundColor: 'green',
  },
  messageRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  userName: {
    fontWeight: 'bold',
    color: '#fff',
  },
  time: {
    fontSize: 12,
    color: '#ddd',
  },
  messageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});
