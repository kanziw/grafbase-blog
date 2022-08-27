import { signInAnonymously, User as UserSchema } from 'firebase/auth'

import { auth } from '../firebase'

interface UserDb {
  getMe(): Promise<User | null>
  mustGetMe(): User
}

export type User = UserSchema;

export const userDb = (): UserDb => ({
  async getMe() {
    if (auth.currentUser) {
      return auth.currentUser
    }
    const userCredential = await signInAnonymously(auth)
    return userCredential.user
  },

  mustGetMe() {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User is not logged in')
    }
    return user
  },
})
