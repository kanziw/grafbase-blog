import './App.css'

import { compact } from 'lodash'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'urql'

import { GamesDocument } from './graphql/schema'

const App = () => {
  const context = useMemo(
    () => ({ additionalTypenames: ['Game'] }),
    [],
  )

  const [{ data, fetching }] = useQuery({ query: GamesDocument, context })
  if (fetching) {
    return <div>Loading...</div>
  }
  const games = compact(data?.gameCollection?.edges?.map(edge => edge?.node) ?? [])

  return (
    <>
      <h1 className="title">미니앱게임천국👼</h1>
      <section className="games">
        <ul>
          {games.map((game) => (
            <li key={`${game.id}`} className="game">
              <Link to={game.slug}>
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
