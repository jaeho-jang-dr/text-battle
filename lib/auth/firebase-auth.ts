import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { COLLECTIONS, UserDoc } from '../firestore/collections';
import { userConverter } from '../firestore/converters';

export async function signUp(email: string, password: string, username: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: username });
    
    const userDoc: UserDoc = {
      uid: user.uid,
      email: email,
      username: username,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(
      doc(db, COLLECTIONS.USERS, user.uid).withConverter(userConverter),
      userDoc
    );
    
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

export async function logOut() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserData(uid: string) {
  try {
    const userDoc = await getDoc(
      doc(db, COLLECTIONS.USERS, uid).withConverter(userConverter)
    );
    
    if (userDoc.exists()) {
      return { data: userDoc.data(), error: null };
    } else {
      return { data: null, error: 'User not found' };
    }
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}