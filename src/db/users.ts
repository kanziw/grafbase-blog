import { signInAnonymously, User as UserSchema } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import { auth } from '../firebase'
import { getCollection } from './core'

interface UserDb {
  getMe(): Promise<Me | null>

  syncToDb(user: Me): Promise<void>

  find(userId: string): Promise<User | null>
  list(userIds: string[]): Promise<User[]>
}

export type Me = UserSchema & {
  displayName: string,
};
export type User = {
  id: string,
  uid: string,
  displayName: string,
  email: string | null,
  emailVerified: boolean,
  isAnonymous: boolean,
  lastLoginAt: Date,
  createdAt: Date,
}
const unknownUser = (id: string): User => ({
  id,
  uid: id,
  displayName: 'Unknown',
  email: null,
  emailVerified: false,
  isAnonymous: true,
  lastLoginAt: new Date(),
  createdAt: new Date(),
})

const usersCol = getCollection<User>('users')

export const userDb = (): UserDb => ({
  async getMe() {
    let me = auth.currentUser as Me | null
    if (!me) {
      const userCredential = await signInAnonymously(auth)
      me = userCredential.user as Me
      me.displayName = `Stranger #${Math.round(Math.random() * 1000)}`
    }

    const dbMe = await this.find(me.uid)
    if (dbMe) {
      me.displayName = dbMe.displayName
    }

    await this.syncToDb(me)

    return me
  },

  async syncToDb(user) {
    await setDoc(doc(usersCol, user.uid), toSerializableUser(user), {
      merge: true,
    })
  },

  async find(userId) {
    const snapshot = await getDoc(doc(usersCol, userId))
    return (snapshot.exists() && snapshot.data()) ? snapshot.data() : null
  },

  async list(userIds) {
    const users = await Promise.all(userIds.map(this.find))

    return userIds.map((userId, idx) => users[idx] ?? unknownUser(userId))
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
