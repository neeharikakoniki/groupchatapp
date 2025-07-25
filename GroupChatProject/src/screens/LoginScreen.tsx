import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import * as Keychain from 'react-native-keychain';
import analytics from '@react-native-firebase/analytics';

type RootStackParamList = {
  Login: undefined;
  Chat: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);

  useEffect(() => {
    const loadStoredCredentials = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          setEmail(credentials.username);
          setPassword(credentials.password);
        }
      } catch (err) {
        console.log('Keychain load error:', err);
      }
    };

    loadStoredCredentials();
  }, []);

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        await analytics().logSignUp({ method: 'email' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        await analytics().logLogin({ method: 'email' });
      }

      await Keychain.setGenericPassword(email, password);
      navigation.replace('Chat');
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'An unexpected error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title={isSignUp ? 'Sign Up' : 'Login'} onPress={handleAuth} />
      <Text
        style={styles.toggle}
        onPress={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp
          ? 'Already have an account? Login'
          : "Don't have an account? Sign Up"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  toggle: { marginTop: 15, color: 'blue', textAlign: 'center' },
});

