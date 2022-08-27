import './App.css'

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Helmet } from './components'
import { User, userDb } from './db'

const games = [
  {
    slug: 'space-worm',
    name: 'SpaceWorm',
    linkUrl: '/space-worm',
    logoImageUrl: '/images/space-worm.jpg',
  },
]

const App = () => {
  const [me, setMe] = useState<User | null>(null)

  useEffect(() => {
    userDb.getMe().then(me => setMe(me))
  }, [])

  return (
    <>
      <Helmet isRoot={true} />
      <h1 className="title">미니앱게임천국👼</h1>
      <section className="users">
        {me && <div>Hello, {me.displayName ?? 'Anonymous'}?</div>}
      </section>
      <section className="games">
        <ul>
          {games.map((game) => (
            <li key={game.slug} className="game">
              <Link to={game.linkUrl}>
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
