import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "Your-Firebase-API-Key",
  authDomain: "Your-Firebase-Auth-Domain",
  projectId: "Your-Firebase-Project-Id",
  storageBucket: "Your-Firebase-Storage-Bucket",
  messagingSenderId: "Your-Firebase-Messaging-Sender-Id",
  appId: "Your-Firebase-App-Id",
  measurementId: "Your-Firebase-Measurement-Id"
};

let app;
let auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;