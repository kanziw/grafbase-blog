import { useEffect, useState } from 'react'

import { User, userDb } from '../db'

export const useMe = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [me, setMe] = useState<User | null>(null)

  useEffect(() => {
    setIsLoading(true)
    userDb()
      .getMe()
      .then(setMe)
      .finally(() => setIsLoading(false))
  }, [])

  return {
    me,
    isLoading,
  }
}
