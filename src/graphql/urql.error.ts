import { errorExchange as urqlErrorExchange } from 'urql'

export const errorExchange = () => (
  urqlErrorExchange({
    onError(error) {
      console.error(error.graphQLErrors[0]?.message ?? 'Network error')
    },
  })
)
