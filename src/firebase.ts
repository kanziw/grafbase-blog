import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyASBpyCRmwl3H0_pMHvG_2rXNvLDkKyixk',
  authDomain: 'miniapp-game-heaven.firebaseapp.com',
  projectId: 'miniapp-game-heaven',
  storageBucket: 'miniapp-game-heaven.appspot.com',
  messagingSenderId: '220322373351',
  appId: '1:220322373351:web:581640f9aa1b78fbb4cc42',
  measurementId: 'G-XT7W1MJ52Q',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth()
export const db = getFirestore(app)

const shouldUseEmulator = process.env.NODE_ENV !== 'production'
if (shouldUseEmulator) {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
}

const _analytics = getAnalytics(app)
