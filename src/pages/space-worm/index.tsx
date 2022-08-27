import './space-worm.css'

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { Helmet } from '../../components/Helmet'
import { gameDb } from '../../db'
import { useCurrentGame } from '../../hooks'
import { gameOnCanvas } from './gameOnCanvas'

export const SpaceWorm = () => {
  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const { game, me } = useCurrentGame()

  useEffect(() => {
    gameOnCanvas(canvasRef.current, {
      saveScore: (score: number) => {
        gameDb().addScore(me.uid, game, score)
      },
      askAndGoToMain: () => {
        if (window.confirm('Go to main?')) {
          navigate('/', { replace: true })
        }
      },
    })
  }, [navigate, game, me.uid])

  return (
    <div className="canvasWrap">
      <Helmet title="SpaceWorm" />
      <canvas ref={canvasRef} className="myCanvas">
        <p>Canvas support required.</p>
      </canvas>
    </div>
  )
}
