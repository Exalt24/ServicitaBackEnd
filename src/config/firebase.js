const { initializeApp } = require("firebase/app");
const { getFirestore, getDoc, getDocs, collection } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};


const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const seekerCollection = collection(db, "seekers");
const providerCollection = collection(db, "providers");



const getAllUsers = async () => {
  try {
    const seekerSnapshot = await getDocs(seekerCollection);
    const providerSnapshot = await getDocs(providerCollection);
    const seekers = [];
    const providers = [];
    seekerSnapshot.forEach((doc) => {
      seekers.push(doc.data());
    });
    providerSnapshot.forEach((doc) => {
      providers.push(doc.data());
    });
    return { seekers, providers };
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = { getAllUsers, firebaseApp, db, seekerCollection, providerCollection };





