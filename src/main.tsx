import './global.css'
import './firebase'
import '@karrotmini/sdk/index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import App from './App'
import { SpaceWorm, Sudoku } from './pages'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" index element={<App />} />
        <Route path="/games/space-worm" element={<SpaceWorm />} />
        <Route path="/games/sudoku" element={<Sudoku />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
