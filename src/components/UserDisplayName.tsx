import { FC, useState } from 'react'

import type { User } from '../db'

export const UserDisplayName: FC<{ me: User }> = ({ me }) => {
  const [isDisplayNameEditing, setIsDisplayNameEditing] = useState(false)
  const [displayName, setDisplayName] = useState(me.displayName)

  return (
    <div>
      👋 Hello, {displayName}
    </div>
  )
}
