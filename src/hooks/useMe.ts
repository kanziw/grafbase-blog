import { karrotmini } from '@karrotmini/sdk'
import { useEffect, useState } from 'react'

import { me as initialMe, User, userDb } from '../db'

export const useMe = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [me, setMe] = useState<User | null>(initialMe)

  useEffect(() => {
    if (!initialMe) {
      setIsLoading(true)
    }
    userDb()
      .getMe()
      .then(setMe)
      .finally(() => setIsLoading(false))
  }, [])
  useEffect(() => {
    karrotmini.subscribe(async() => {
      const karrotUser = karrotmini.getKarrotUser()

      const user = await userDb().findOneUserByKarrotUserId(karrotUser.id)
      if (user) {
        await userDb().updateKarrotminiUser(user, karrotUser).then(setMe)
      }
    })
  })

  return {
    me,
    isLoading,
  }
}
