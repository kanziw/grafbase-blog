import { collection, CollectionReference, DocumentData } from 'firebase/firestore'

import { db } from '../firebase'

export const getCollection = <T extends DocumentData>(collectionName: string): CollectionReference<T> => (
  collection(db, collectionName) as CollectionReference<T>
)
