import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { User, userDb } from '../db'

export const LoginFirst = () => {
  const [me, setMe] = useState<User | null>(null)
  useEffect(() => {
    userDb().getMe().then(setMe)
  }, [])

  if (!me) {
    return <div>Loading...</div>
  }

  return <Outlet />
}
