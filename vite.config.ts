import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  switch (process.env.VERCEL_ENV) {
    case 'production': {
      process.env.VITE_GRAFBASE_API_URL = 'https://miniapp-game-heaven-kanziw.grafbase.app/graphql'
      break
    }
    case 'preview': {
      process.env.VITE_GRAFBASE_API_URL = `https://miniapp-game-heaven-${process.env.VERCEL_GIT_COMMIT_REF}-kanziw.grafbase.app/graphql`
      break
    }
  }

  return {
    plugins: [react()],
  }
})
