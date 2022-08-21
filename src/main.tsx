import './global.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import { Provider as UrqlProvider } from 'urql'

import App from './App'
import { urqlClient } from './graphql/urql'
import { SpaceWorm } from './pages'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UrqlProvider value={urqlClient}>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/space-worm" element={<SpaceWorm />} />
        </Routes>
      </Router>
    </UrqlProvider>
  </React.StrictMode>,
)
