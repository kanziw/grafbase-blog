import './space-worm.css'

import { useEffect, useRef } from 'react'

import { gameOnCanvas } from './gameOnCanvas'

export const SpaceWorm = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    gameOnCanvas(canvasRef.current)
  }, [])
  return (
    <div className="canvasWrap">
      <canvas ref={canvasRef} className="myCanvas">
        <p>Canvas support required.</p>
      </canvas>
    </div>
  )
}
