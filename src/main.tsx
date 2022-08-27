import './global.css'
import './firebase'

import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'

import App from './App'
import { LoginFirst } from './components'
import { SpaceWorm } from './pages'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="games" element={<LoginFirst />}>
          <Route path="space-worm" element={<SpaceWorm />} />
        </Route>
      </Routes>
    </Router>,
  </React.StrictMode>,
)
