import { useEffect, useState } from 'react'

import { Me, userDb } from '../db'

export const useMe = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [me, setMe] = useState<Me | null>(null)

  useEffect(() => {
    setIsLoading(true)
    userDb().getMe()
      .then(setMe)
      .finally(() => setIsLoading(false))
  }, [])

  return {
    me,
    isLoading,
  }
}
