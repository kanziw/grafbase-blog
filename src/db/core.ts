import { collection, CollectionReference, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'

import { db } from '../firebase'

export type WithId<T> = T & { id: string }
export const withId = <T>(s: QueryDocumentSnapshot<T>) => ({
  id: s.id,
  ...s.data(),
})

export const getCollection = <T extends DocumentData>(collectionName: string): CollectionReference<T> => (
  collection(db, collectionName) as CollectionReference<T>
)
