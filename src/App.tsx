import './App.css'

import { Link } from 'react-router-dom'

const games = [
  {
    id: 'space-worm',
    name: 'SpaceWorm',
    path: '/space-worm',
    imgSrc: '/images/space-worm.jpg',
  },
]

const App = () => (
  <>
    <h1 className="title">미니앱게임천국👼</h1>
    <section className="games">
      <ul>
        {games.map((game) => (
          <li key={`${game.id}`} className="game">
            <Link to={game.path}>
              <div className="game-logo-img"><img src={game.imgSrc} alt={game.name} /></div>
              <div className="game-name">{game.name}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  </>
)

export default App
