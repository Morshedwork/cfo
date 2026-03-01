// Firebase Authentication utilities
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
} from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { COLLECTIONS } from './db';

// Google Sign In
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  const result = await signInWithPopup(auth, provider);
  
  // Create/update user profile in Firestore
  const userRef = doc(db, COLLECTIONS.USERS, result.user.uid);
  await setDoc(userRef, {
    email: result.user.email,
    fullName: result.user.displayName,
    avatarUrl: result.user.photoURL,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }, { merge: true });
  
  return result;
};

// Email/Password Sign Up
export const signUpWithEmail = async (email: string, password: string, fullName?: string): Promise<UserCredential> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update profile with display name
  if (fullName) {
    await updateProfile(result.user, { displayName: fullName });
  }
  
  // Create user profile in Firestore
  const userRef = doc(db, COLLECTIONS.USERS, result.user.uid);
  await setDoc(userRef, {
    email: result.user.email,
    fullName: fullName || '',
    avatarUrl: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  return result;
};

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Sign Out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Password Reset
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Update User Profile
export const updateUserProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  
  await updateProfile(user, {
    displayName: displayName || user.displayName,
    photoURL: photoURL || user.photoURL,
  });
  
  // Update Firestore profile
  const userRef = doc(db, COLLECTIONS.USERS, user.uid);
  await setDoc(userRef, {
    fullName: displayName || user.displayName,
    avatarUrl: photoURL || user.photoURL,
    updatedAt: Timestamp.now(),
  }, { merge: true });
};

// Update Email
export const updateUserEmail = async (newEmail: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  
  await updateEmail(user, newEmail);
  
  // Update Firestore profile
  const userRef = doc(db, COLLECTIONS.USERS, user.uid);
  await setDoc(userRef, {
    email: newEmail,
    updatedAt: Timestamp.now(),
  }, { merge: true });
};

// Update Password
export const updateUserPassword = async (newPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  
  await updatePassword(user, newPassword);
};

// Auth State Observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get Current User
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

