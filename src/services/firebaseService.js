import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// User profile
export async function createUserProfile(user) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
  } else {
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
  }
}

// Saved trips
export async function saveTrip(userId, tripData) {
  const tripId = `${tripData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  const tripRef = doc(db, 'users', userId, 'savedTrips', tripId);
  
  await setDoc(tripRef, {
    ...tripData,
    customName: tripData.name,
    group: tripData.group || '',
    savedAt: serverTimestamp(),
    id: tripId
  });
  
  return tripId;
}

export async function getSavedTrips(userId) {
  const tripsRef = collection(db, 'users', userId, 'savedTrips');
  
  let snapshot;
  try {
    const q = query(tripsRef, orderBy('savedAt', 'desc'));
    snapshot = await getDocs(q);
  } catch (err) {
    console.warn('orderBy failed, fetching without order:', err.message);
    snapshot = await getDocs(tripsRef);
  }
  
  const trips = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
    savedAt: d.data().savedAt?.toDate?.() || new Date()
  }));
  
  return trips.sort((a, b) => b.savedAt - a.savedAt);
}

export async function deleteSavedTrip(userId, tripId) {
  await deleteDoc(doc(db, 'users', userId, 'savedTrips', tripId));
}

// Rename a saved trip
export async function renameSavedTrip(userId, tripId, newName) {
  const tripRef = doc(db, 'users', userId, 'savedTrips', tripId);
  await updateDoc(tripRef, { customName: newName });
}

// Update trip group
export async function updateTripGroup(userId, tripId, groupName) {
  const tripRef = doc(db, 'users', userId, 'savedTrips', tripId);
  await updateDoc(tripRef, { group: groupName });
}

// ===== Shared Trips =====
export async function createSharedTrip(tripData, userId) {
  const shareId = `share-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const shareRef = doc(db, 'sharedTrips', shareId);
  
  await setDoc(shareRef, {
    ...tripData,
    shareId,
    sharedBy: userId,
    sharedAt: serverTimestamp(),
  });
  
  return shareId;
}

export async function getSharedTrip(shareId) {
  const shareRef = doc(db, 'sharedTrips', shareId);
  const snap = await getDoc(shareRef);
  
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Search history
export async function saveSearchHistory(userId, searchData) {
  const searchId = `search-${Date.now()}`;
  const searchRef = doc(db, 'users', userId, 'searchHistory', searchId);
  
  await setDoc(searchRef, {
    ...searchData,
    searchedAt: serverTimestamp(),
    id: searchId
  });
}

export async function getSearchHistory(userId) {
  const historyRef = collection(db, 'users', userId, 'searchHistory');
  
  let snapshot;
  try {
    const q = query(historyRef, orderBy('searchedAt', 'desc'), limit(10));
    snapshot = await getDocs(q);
  } catch (err) {
    console.warn('orderBy failed, fetching without order:', err.message);
    snapshot = await getDocs(historyRef);
  }
  
  const history = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
    searchedAt: d.data().searchedAt?.toDate?.() || new Date()
  }));
  
  return history.sort((a, b) => b.searchedAt - a.searchedAt).slice(0, 10);
}
