import './space-worm.css'

import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { Helmet } from '../../components/Helmet'
import { gameOnCanvas } from './gameOnCanvas'

export const SpaceWorm = () => {
  const canvasRef = useRef(null)
  const navigate = useNavigate()

  const saveScore = (score: number) => {
    console.log(' CB saveScore: ', score)
  }
  const goToMain = useCallback(() => {
    console.log(' CB goToMain')
    navigate('/', { replace: true })
  }, [navigate])

  useEffect(() => {
    gameOnCanvas(canvasRef.current, { saveScore, goToMain })
  }, [goToMain])

  return (
    <div className="canvasWrap">
      <Helmet title="SpaceWorm" />
      <canvas ref={canvasRef} className="myCanvas">
        <p>Canvas support required.</p>
      </canvas>
    </div>
  )
}
