import { signInAnonymously, User as UserSchema } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

import { auth } from '../firebase'
import { getCollection } from './core'

interface UserDb {
  getMe(): Promise<Me | null>
  mustGetMe(): Me

  syncToDb(user: Me): Promise<void>

  list(userIds: string[]): Promise<Me[]>
}

export type Me = UserSchema;
type User = {
  id: string,
  uid: string,
  displayName: string | null,
  email: string | null,
  emailVerified: boolean,
  isAnonymous: boolean,
  lastLoginAt: Date,
  createdAt: Date,
}

const usersCol = getCollection('users')

export const userDb = (): UserDb => ({
  async getMe() {
    let user = auth.currentUser
    if (!user) {
      const userCredential = await signInAnonymously(auth)
      user = userCredential.user
    }
    await this.syncToDb(user)

    return user
  },

  mustGetMe() {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User is not logged in')
    }
    return user
  },

  async syncToDb(user) {
    await setDoc(doc(usersCol, user.uid), toSerializableUser(user), {
      merge: true,
    })
  },

  async list(userIds) {
    return []
  },
})

function toSerializableUser(me: Me): User {
  return {
    id: me.uid,
    uid: me.uid,
    displayName: me.displayName ?? null,
    email: me.email ?? null,
    emailVerified: me.emailVerified,
    isAnonymous: me.isAnonymous,
    lastLoginAt: optionalStrToDate(me.metadata.lastSignInTime),
    createdAt: optionalStrToDate(me.metadata.creationTime),
  }
}

function optionalStrToDate(str: string | undefined): Date {
  if (!str) {
    return new Date()
  }
  return new Date(str)
}
