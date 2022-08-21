import { cacheExchange as graphCache } from '@urql/exchange-graphcache'

export const cacheExchange = () => (
  // @see https://github.com/grafbase/grafbase/blob/main/examples/nextjs/src/graphql/urql.exchange.ts
  graphCache()
)
