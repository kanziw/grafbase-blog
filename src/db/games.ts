import { addDoc } from 'firebase/firestore'

import { getCollection } from './core'

interface GameDb {
  list(): GameWithLinkUrl[],
  findOne(slug: string): Game,

  addScore(userId: string, game: Game, score: number): Promise<void>,
}

export type Game = {
  slug: string,
  name: string,
  logoImageUrl: string
}
type GameWithLinkUrl = Game & { linkUrl: string }
type GameScore = {
  gameSlug: string,
  score: number,
  userId: string,
}

const games: Game[] = [
  {
    slug: 'space-worm',
    name: 'SpaceWorm',
    logoImageUrl: '/images/space-worm.jpg',
  },
]

const gameScoresCol = getCollection<GameScore>('gameScores')

export const gameDb = (): GameDb => ({
  list() {
    return games.map(game => ({ ...game, linkUrl: `/games/${game.slug}` }))
  },

  findOne(slug) {
    const game = games.find(game => game.slug === slug)
    if (!game) {
      throw new Error(`Game not found: ${slug}`)
    }

    return game
  },

  async addScore(userId, game, score) {
    await addDoc(gameScoresCol, { gameSlug: game.slug, score, userId })
  },
})
