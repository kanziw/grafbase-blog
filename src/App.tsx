import './App.css'

import { CheckIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { ChangeEvent, KeyboardEvent, useState } from 'react'
import { Link } from 'react-router-dom'

import { Helmet } from './components'
import { gameDb, userDb } from './db'
import { useMe } from './hooks'

const App = () => {
  const games = gameDb().list()
  const { me, isLoading } = useMe()

  const [isDisplayNameEditing, setIsDisplayNameEditing] = useState(false)
  const [displayName, setDisplayName] = useState(me?.displayName)

  if (isLoading || !me) {
    return <div>Loading...</div>
  }
  if (!displayName && me.displayName) {
    setDisplayName(me.displayName)
  }

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

  return (
    <>
      <Helmet isRoot={true} />
      <h1 className="title">미니앱게임천국👼</h1>
      <section className="users">
        <div>
          👋 Hello, {isDisplayNameEditing
          ? <input
              type='text'
              value={displayName} onChange={onDisplayNameInputChange}
              onKeyUp={onDisplayNameInputKeyUp}
              />
          : displayName}
          {isDisplayNameEditing
            ? <CheckIcon className="edit" onClick={onDisplayNameSave} />
            : <PencilSquareIcon className="edit" onClick={onDisplayNameEditButtonClick} />
          }
        </div>
      </section>
      <section className="games">
        <ul>
          {games.map((game) => (
            <li key={game.slug} className="game">
              <Link to={game.linkUrl} state={{ game }}>
                <div className="game-logo-img"><img src={game.logoImageUrl} alt={game.name} /></div>
                <div className="game-name">{game.name}</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default App
