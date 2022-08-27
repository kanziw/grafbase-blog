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
  const { game, me, top10Scores, isLoading } = useCurrentGame()

  useEffect(() => {
    if (top10Scores && canvasRef.current) {
      gameOnCanvas(canvasRef.current, {
        top10Scores,
        saveScore: (score: number) => {
          gameDb().upsertScoreIfHigher(game, me, score)
        },
        askAndGoToMain: () => {
          if (window.confirm('Go to main?')) {
            navigate('/', { replace: true })
          }
        },
      })
    }
  }, [top10Scores, canvasRef.current])

  if (isLoading) {
    return <div>Loading..</div>
  }

  return (
    <div className="canvasWrap">
      <Helmet title="SpaceWorm" />
      <canvas ref={canvasRef} className="myCanvas">
        <p>Canvas support required.</p>
      </canvas>
    </div>
  )
}
