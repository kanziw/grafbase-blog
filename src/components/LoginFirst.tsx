import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Me, userDb } from '../db'

export const LoginFirst = () => {
  const [me, setMe] = useState<Me | null>(null)
  useEffect(() => {
    userDb().getMe().then(setMe)
  }, [])

  if (!me) {
    return <div>Loading...</div>
  }

  return <Outlet />
}
