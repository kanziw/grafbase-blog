import './App.css'

import { Link } from 'react-router-dom'

import { Helmet } from './components'

const games = [
  {
    slug: 'space-worm',
    name: 'SpaceWorm',
    linkUrl: '/space-worm',
    logoImageUrl: '/images/space-worm.jpg',
  },
]

const App = () => (
  <>
    <Helmet isRoot={true} />
    <h1 className="title">미니앱게임천국👼</h1>
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

export default App
