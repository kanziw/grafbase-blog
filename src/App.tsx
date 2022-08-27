import './App.css'

import { Link } from 'react-router-dom'

import { Helmet, UserDisplayName } from './components'
import { gameDb, userDb } from './db'
import { useMe } from './hooks'

const App = () => {
  const games = gameDb().list()
  const { me, isLoading } = useMe()
  if (isLoading || !me) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Helmet isRoot={true} />
      <h1 className="title">미니앱게임천국👼</h1>
      <UserDisplayName me={me} />
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
