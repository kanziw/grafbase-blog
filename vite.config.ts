import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  switch (process.env.VERCEL_ENV) {
    case 'production': {
      process.env.VITE_GRAFBASE_API_URL = 'https://miniapp-game-heaven-kanziw.grafbase.app/graphql'
      process.env.VITE_GRAFBASE_PUBLIC_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjEwNzQ3NDksImlzcyI6ImdyYWZiYXNlIiwiYXVkIjoiMDFHQVpGUUpZOENNUDNBRDJHQzVEWTJFWTEiLCJqdGkiOiIwMUdBWldBRTE5Qjc2QTlBNzgxRFQ1RzEzQiIsImVudiI6InByb2R1Y3Rpb24iLCJwdXJwb3NlIjoicHJvamVjdC1hcGkta2V5In0.2_cfKQL7tqD_KYwpdz3XOY6JiWK3KEmwJTYd20gEHZU'
      break
    }
    case 'preview': {
      process.env.VITE_GRAFBASE_API_URL = `https://miniapp-game-heaven-${process.env.VERCEL_GIT_COMMIT_REF}-kanziw.grafbase.app/graphql`
      process.env.VITE_GRAFBASE_PUBLIC_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjEwNzQ2OTMsImlzcyI6ImdyYWZiYXNlIiwiYXVkIjoiMDFHQVpGUUpZOENNUDNBRDJHQzVEWTJFWTEiLCJqdGkiOiIwMUdBWlc4UTRONlhBTTBHUDRBVDFZWTdTMSIsImVudiI6InByZXZpZXciLCJwdXJwb3NlIjoicHJvamVjdC1hcGkta2V5In0.6dDYFQuim4pxPq8I4XhBDaz1NMQVL0bUbaD1OcDqWg0'
      break
    }
  }

  return {
    plugins: [react()],
  }
})
