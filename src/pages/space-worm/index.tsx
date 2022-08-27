import './space-worm.css'

import { useEffect, useRef } from 'react'

import { Helmet } from '../../components/Helmet'
import { gameOnCanvas } from './gameOnCanvas'

export const SpaceWorm = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    gameOnCanvas(canvasRef.current)
  }, [])
  return (
    <div className="canvasWrap">
      <Helmet title="SpaceWorm" />
      <canvas ref={canvasRef} className="myCanvas">
        <p>Canvas support required.</p>
      </canvas>
    </div>
  )
}
