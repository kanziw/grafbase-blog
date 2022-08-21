import './global.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import { SpaceWorm } from './space-worm'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SpaceWorm />
  </React.StrictMode>,
)
