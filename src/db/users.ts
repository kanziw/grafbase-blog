import { karrotmini, KarrotUser } from '@karrotmini/sdk'
import {
  signInAnonymously,
  updateProfile,
  User as UserSchema,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

import { auth } from '../firebase'
import { getCollection } from './core'

interface UserDb {
  getMe(): Promise<User>;
  findOneUserByKarrotUserId(karrotUserId: string): Promise<User | null>;

  insertKarrotminiUser(karrotUser: KarrotUser): Promise<User>;
  updateKarrotminiUser(user: User, karrotUser: KarrotUser): Promise<User>;

  insertFirebaseUser(fbUser: FirebaseUser): Promise<User>;

  find(userId: string): Promise<User | null>;
  list(userIds: string[]): Promise<User[]>;
}

export type FirebaseUser = UserSchema & {
  displayName: string;
  karrotUser: KarrotUser | null;
};
export type User = {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  email: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  karrotUser: KarrotUser | null;
  lastSignedInAt: Date;
  createdAt: Date;
};
const unknownUser = (id: string): User => ({
  id,
  uid: id,
  displayName: 'Unknown',
  photoURL: null,
  email: null,
  emailVerified: false,
  isAnonymous: true,
  karrotUser: null,
  lastSignedInAt: new Date(),
  createdAt: new Date(),
})

const usersCol = getCollection<User>('users')
const karrotminiUsersCol = getCollection<User>('karrotminiUsers')
const isKarrotmini = !karrotmini.getKarrotUser().id.startsWith('id:')
export let me: User | null = null

export const userDb = (): UserDb => ({
  async getMe() {
    if (isKarrotmini) {
      const { karrotUser } = await karrotmini.requestUserConsent({
        scopes: ['account/profile'],
      })

      const karrotminiUser = await this.findOneUserByKarrotUserId(
        karrotUser.id,
      )

      me = karrotminiUser
        ? await this.updateKarrotminiUser(karrotminiUser, karrotUser)
        : await this.insertKarrotminiUser(karrotUser)
    } else {
      let fbUser = auth.currentUser as FirebaseUser | null
      if (!fbUser) {
        const userCredential = await signInAnonymously(auth)
        fbUser = userCredential.user as FirebaseUser
      }
      if (!fbUser.displayName) {
        await updateProfile(fbUser, { displayName: randomDisplayName() })
      }

      me = toUser(fbUser)
    }

    return me
  },

  async findOneUserByKarrotUserId(karrotUserId: string) {
    const snapshot = await getDoc(doc(karrotminiUsersCol, karrotUserId))
    return snapshot.exists() && snapshot.data() ? snapshot.data() : null
  },

  async insertKarrotminiUser(karrotUser) {
    const now = new Date()
    const user: User = {
      id: karrotUser.id,
      uid: karrotUser.id,
      displayName: karrotUser.nickname ?? randomDisplayName(),
      photoURL: (karrotUser.profileImage?.url as string) ?? null,
      email: null,
      emailVerified: false,
      isAnonymous: false,
      karrotUser,
      lastSignedInAt: now,
      createdAt: now,
    }

    await setDoc(doc(karrotminiUsersCol, user.uid), user)

    return user
  },

  async updateKarrotminiUser(user, karrotUser) {
    const partialUser = {
      displayName: karrotUser.nickname ?? user.displayName,
      photoURL: karrotUser.profileImage?.url ?? user.photoURL,
      karrotUser,
      lastSignedInAt: new Date(),
    }
    await updateDoc(doc(karrotminiUsersCol, karrotUser.id), partialUser)

    me = {
      ...user,
      ...partialUser,
    }

    return me
  },

  async insertFirebaseUser(fbUser) {
    const user = toUser(fbUser)
    await setDoc(doc(usersCol, fbUser.uid), user)
    return user
  },

  async find(userId) {
    const snapshot = await getDoc(doc(usersCol, userId))
    return snapshot.exists() && snapshot.data() ? snapshot.data() : null
  },

  async list(userIds) {
    const users = await Promise.all(userIds.map(this.find))

    return userIds.map((userId, idx) => users[idx] ?? unknownUser(userId))
  },
})

function toUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    displayName: fbUser.displayName ?? null,
    photoURL: fbUser.photoURL,
    email: fbUser.email ?? null,
    emailVerified: fbUser.emailVerified,
    isAnonymous: fbUser.isAnonymous,
    karrotUser: fbUser.karrotUser ?? null,
    lastSignedInAt: optionalStrToDate(fbUser.metadata.lastSignInTime),
    createdAt: optionalStrToDate(fbUser.metadata.creationTime),
  }
}

function optionalStrToDate(str: string | undefined): Date {
  if (!str) {
    return new Date()
  }
  return new Date(str)
}

function randomDisplayName() {
  return `Stranger #${Math.round(Math.random() * 1000)}`
}
