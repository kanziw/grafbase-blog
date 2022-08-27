interface GameDb {
  listGames(): Game[],
}

type Game = {
  slug: string,
  name: string,
  linkUrl: string,
  logoImageUrl: string
}

const games: Game[] = [
  {
    slug: 'space-worm',
    name: 'SpaceWorm',
    linkUrl: '/space-worm',
    logoImageUrl: '/images/space-worm.jpg',
  },
]

export const gameDb = (): GameDb => ({
  listGames() {
    return games
  },
})
