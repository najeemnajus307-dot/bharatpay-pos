import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

let firebaseApp = null;
let db = null;
let auth = null;

/**
 * Dynamically initialises Firebase with user credentials from application settings
 * @param {Object} config - Firebase client configurations
 */
export const initializeDynamicFirebase = (config) => {
  if (!config || !config.apiKey || !config.projectId || !config.authDomain) {
    db = null;
    auth = null;
    firebaseApp = null;
    return { initialized: false, message: "Firebase configs empty. Running in Offline Local Mode." };
  }

  try {
    const apps = getApps();
    if (apps.length > 0) {
      // Re-use or rebuild existing application instance
      firebaseApp = apps[0];
    } else {
      firebaseApp = initializeApp(config);
    }
    
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    
    return { 
      initialized: true, 
      db, 
      auth, 
      message: "Connected to Firebase Cloud successfully!" 
    };
  } catch (error) {
    console.error("Dynamic Firebase initialization error:", error);
    db = null;
    auth = null;
    firebaseApp = null;
    return { 
      initialized: false, 
      error: error.message, 
      message: "Firebase connection failed. Reverted to Local-First Mode." 
    };
  }
};

export const getDb = () => db;
export const getFirebaseAuth = () => auth;
export const isCloudConnected = () => !!db;
