import { karrotmini, KarrotUser } from '@karrotmini/sdk'
import {
  signInAnonymously,
  updateProfile,
  User as UserSchema,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import { auth } from '../firebase'
import { getCollection } from './core'

interface UserDb {
  getMe(): Promise<Me | null>;

  syncToDb(user: Me): Promise<void>;
  subscribeKarrotUser(): void;

  find(userId: string): Promise<User | null>;
  list(userIds: string[]): Promise<User[]>;

  updateDisplayName(me: Me, displayName: string): Promise<void>;
}

export type Me = UserSchema & {
  displayName: string;
  karrotUser: KarrotUser | null;
};
export type User = {
  id: string;
  uid: string;
  displayName: string;
  email: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  karrotUser: KarrotUser | null;
  lastLoginAt: Date;
  createdAt: Date;
};
const unknownUser = (id: string): User => ({
  id,
  uid: id,
  displayName: 'Unknown',
  email: null,
  emailVerified: false,
  isAnonymous: true,
  karrotUser: null,
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

      if (!me.displayName) {
        await this.updateDisplayName(
          me,
          `Stranger #${Math.round(Math.random() * 1000)}`,
        )
      }
    }
    const karrotUser = karrotmini.getKarrotUser()
    if (isRealKarrotUser(karrotUser)) {
      await karrotmini.requestUserConsent({ scopes: ['account/profile'] })
      if (karrotUser.nickname) {
        me.displayName = karrotUser.nickname
      }
    }

    await this.syncToDb(me)

    return me
  },

  async syncToDb(user) {
    await setDoc(doc(usersCol, user.uid), toUser(user), {
      merge: true,
    })
  },

  subscribeKarrotUser() {
    karrotmini.subscribe(() => {
      const me = auth.currentUser as Me | null
      const karrotUser = karrotmini.getKarrotUser()
      if (me && isRealKarrotUser(karrotUser)) {
        if (isRealKarrotUser(karrotUser)) {
          me.karrotUser = karrotUser
          this.syncToDb(me)
        }
      }
    })
  },

  async find(userId) {
    const snapshot = await getDoc(doc(usersCol, userId))
    return snapshot.exists() && snapshot.data() ? snapshot.data() : null
  },

  async list(userIds) {
    const users = await Promise.all(userIds.map(this.find))

    return userIds.map((userId, idx) => users[idx] ?? unknownUser(userId))
  },

  async updateDisplayName(me, displayName) {
    await updateProfile(me, { displayName })
    await this.syncToDb(me)
  },
})
userDb().subscribeKarrotUser()

function toUser(me: Me): User {
  return {
    id: me.uid,
    uid: me.uid,
    displayName: me.displayName ?? null,
    email: me.email ?? null,
    emailVerified: me.emailVerified,
    isAnonymous: me.isAnonymous,
    karrotUser: me.karrotUser ?? null,
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

function isRealKarrotUser(karrotUser: KarrotUser): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true
  }
  return !karrotUser.id.startsWith('id:')
}
