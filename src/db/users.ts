import { signInAnonymously, User as UserSchema } from 'firebase/auth'

import { auth } from '../firebase'

export interface UserDb {
  getMe(): Promise<User | null>
}

export type User = UserSchema;

export const userDb: UserDb = ({
  async getMe() {
    if (auth.currentUser) {
      return auth.currentUser
    }
    const userCredential = await signInAnonymously(auth)
    return userCredential.user
  },
})
