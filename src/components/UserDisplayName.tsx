import { CheckIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { ChangeEvent, FC, KeyboardEvent, useState } from 'react'

import { Me, userDb } from '../db'

export const UserDisplayName: FC<{me: Me}> = ({ me }) => {
  const [isDisplayNameEditing, setIsDisplayNameEditing] = useState(false)
  const [displayName, setDisplayName] = useState(me.displayName)

  const onDisplayNameEditButtonClick = () => {
    setIsDisplayNameEditing(true)
  }
  const onDisplayNameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.currentTarget.value)
    e.preventDefault()
  }
  const onDisplayNameSave = () => {
    setIsDisplayNameEditing(false)
    if (displayName) {
      userDb().updateDisplayName(me, displayName)
    }
  }
  const onDisplayNameInputKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onDisplayNameSave()
    }
  }

  const EditOrSaveButton = () => isDisplayNameEditing
    ? <CheckIcon style={{ height: '0.8rem', cursor: 'pointer' }} onClick={onDisplayNameSave} />
    : <PencilSquareIcon style={{ height: '0.8rem', cursor: 'pointer' }} onClick={onDisplayNameEditButtonClick} />

  return (
    <div style={{ textAlign: 'center' }}>
      👋 Hello, {isDisplayNameEditing
      ? <input
          type='text'
          value={displayName} onChange={onDisplayNameInputChange}
          onKeyUp={onDisplayNameInputKeyUp}
            />
      : displayName}
      <EditOrSaveButton />
    </div>
  )
}
