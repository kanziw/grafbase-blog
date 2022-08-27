import { doc, getDoc, getDocs, limit, orderBy, query, setDoc, Timestamp, where } from 'firebase/firestore'

import { getCollection, WithId, withId } from './core'
import type { User } from './users'

interface GameDb {
  list(): GameWithLinkUrl[],
  findOne(slug: string): Game,

  upsertScoreIfHigher(game: Game, user: User, score: number): Promise<void>,
  listTop10Ranks(game: Game): Promise<GameScore[]>,
}

export type Game = {
  slug: string,
  name: string,
  logoImageUrl: string
}
type GameWithLinkUrl = Game & { linkUrl: string }
type GameScoreWithoutId = {
  gameSlug: string,
  score: number,
  userId: string,
  scoredAt: Date,
}
export type GameScore = WithId<GameScoreWithoutId>

const games: Game[] = [
  {
    slug: 'space-worm',
    name: 'SpaceWorm',
    logoImageUrl: '/images/space-worm.jpg',
  },
]

const gameScoresCol = getCollection<GameScoreWithoutId>('gameScores')

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

  async upsertScoreIfHigher(game, user, score) {
    if (score <= 0) {
      return
    }

    const ref = doc(gameScoresCol, gameScoreId(game.slug, user.uid))
    const snapshot = await getDoc(ref)
    if (snapshot.exists() && score <= snapshot.data().score) {
      return
    }

    await setDoc<GameScoreWithoutId>(ref, {
      gameSlug: game.slug,
      score,
      userId: user.uid,
      scoredAt: Timestamp.now(),
    }, { merge: true })
  },

  async listTop10Ranks(game) {
    const snapshots = await getDocs(query(
      gameScoresCol,
      where('gameSlug', '==', game.slug),
      orderBy('score', 'desc'),
      orderBy('scoredAt', 'asc'),
      limit(10),
    ))
    return snapshots.docs.map(withId).map(toGameScore)
  },
})

function gameScoreId(gameSlug: string, userId: string) {
  return `${gameSlug}:${userId}`
}

function toGameScore(doc: GameScore): GameScore {
  return {
    ...doc,
    scoredAt: (doc.scoredAt as unknown as Timestamp).toDate(),
  }
}
