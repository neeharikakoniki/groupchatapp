import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import analytics from '@react-native-firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBsutiKz7HglwcRzwW9Bbb9-4gYNZBP0Og",
  authDomain: "group-chat-434f0.firebaseapp.com",
  projectId: "group-chat-434f0",
  storageBucket: "group-chat-434f0.firebasestorage.app",
  messagingSenderId: "685837827901",
  appId: "1:685837827901:android:9dabe3bc193851d08e4f54",
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { auth, db, analytics };
