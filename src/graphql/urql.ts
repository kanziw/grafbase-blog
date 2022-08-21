import type { ClientOptions } from '@urql/core/dist/types/client'
import { createClient, dedupExchange, fetchExchange } from 'urql'

import { errorExchange } from './urql.error'
import { cacheExchange } from './urql.exchange'

const urqlClientBaseConfig: ClientOptions = {
  url: import.meta.env.VITE_GRAFBASE_API_URL,
  fetchOptions: {
    headers: {
      'x-api-key': import.meta.env.VITE_GRAFBASE_PUBLIC_API_KEY,
    },
  },
  requestPolicy: 'cache-and-network',
}

export const urqlClient = createClient({
  ...urqlClientBaseConfig,
  exchanges: [dedupExchange, cacheExchange(), errorExchange(), fetchExchange],
})
