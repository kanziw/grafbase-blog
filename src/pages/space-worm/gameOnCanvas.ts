/* eslint-disable */
// @ts-nocheck
// https://github.com/dancramp/js13k-2021

import type { GameScoreWithUser } from '../../hooks'
import gameEvents, { Callbacks, onState, State } from './events'

type Props = Callbacks & {
  top10Scores: GameScoreWithUser[],
}

export const gameOnCanvas = (spaceWorm_canvas, { top10Scores, ...callbacks }: Props) => {
  const spaceWorm_ctx = spaceWorm_canvas.getContext('2d')

  // get the device DPI - to use in the window resize function
  let spaceWorm_scale = window.devicePixelRatio

  // start audio
  const spaceWorm_AudioContext = window.AudioContext || window.webkitAudioContext
  const spaceWorm_audioCtx = new spaceWorm_AudioContext()
  const spaceWorm_volumeGain = spaceWorm_audioCtx.createGain()
  spaceWorm_volumeGain.connect(spaceWorm_audioCtx.destination)
  spaceWorm_volumeGain.gain.value = 0.1

  // pentatonics:
  const spaceWorm_bgNotes = [110, 130.81, 146.83, 164.81, 196, 220]
  const spaceWorm_cNotes = [440, 493.88, 523.25, 587.33, 622.25, 659.25, 698.46, 783.99, 880]
  const spaceWorm_nativeWidth = 64
  const spaceWorm_nativeHeight = 64

  // for debugging the spaceWorm_level
  // spaceWorm_nativeWidth = 256; spaceWorm_nativeHeight = 256;

  let spaceWorm_deviceWidth = window.innerWidth
  let spaceWorm_deviceHeight = window.innerHeight

  // get scale ratio for scaling up
  let spaceWorm_scaleFitNative = Math.min(spaceWorm_deviceWidth / spaceWorm_nativeWidth, spaceWorm_deviceHeight / spaceWorm_nativeHeight)

  // controller variables
  let spaceWorm_mouseDown = false
  let spaceWorm_mouseMove = false
  let spaceWorm_state: State = 'start'
  let spaceWorm_drawJoy = false
  let spaceWorm_joyAngle = 0
  let spaceWorm_joyDistance = 0

  // movement variables
  let spaceWorm_vx = 0
  let spaceWorm_vy = 0
  let spaceWorm_worldX = 0
  let spaceWorm_worldY = 0
  let spaceWorm_oldWorldX = 0
  let spaceWorm_oldWorldY = 0
  const spaceWorm_friction = 0.99
  const spaceWorm_maxspeed = 20

  // level variables
  let spaceWorm_background = []
  let spaceWorm_stars = []
  let spaceWorm_enemies = []
  let spaceWorm_tailComponent = []
  let spaceWorm_levelObstacles = []
  let spaceWorm_walls = []
  let spaceWorm_killerWalls = []
  let spaceWorm_worldBoundsX = 0
  let spaceWorm_worldBoundsY = 0
  let spaceWorm_worldBoundsWidth = 0
  let spaceWorm_worldBoundsHeight = 0
  let spaceWorm_commonUnit = 0
  let spaceWorm_score = 0
  let spaceWorm_starsRemaining = 0

  let spaceWorm_joyStartX; let spaceWorm_joyStartY; let spaceWorm_joyEndX; let spaceWorm_joyEndY

  // player
  const spaceWorm_player = new spaceWorm_playerComponent()

  // levels
  let spaceWorm_level = 1

  function updateGameState(state: 'levelstart' | 'playing' | 'gameover' | 'levelcomplete' | 'start') {
    spaceWorm_state = state

    const onState: onState = {
      state,
      level: spaceWorm_level,
      currentStageRemainingStars: spaceWorm_starsRemaining,
      callbacks,
    }
    gameEvents.emit('state', onState)
  }

  spaceWorm_canvas.width = spaceWorm_deviceWidth
  spaceWorm_canvas.height = spaceWorm_deviceHeight

  // controls
  // get position of touch down - for joystick base
  spaceWorm_canvas.addEventListener('touchstart', (e) => {
    spaceWorm_joyStartX = e.touches[0].clientX; spaceWorm_joyStartY = e.touches[0].clientY; spaceWorm_joyStart(); e.preventDefault()
  })
  // track where touch moves to - for joystick knob
  spaceWorm_canvas.addEventListener('touchmove', (e) => {
    spaceWorm_joyEndX = e.changedTouches[0].pageX; spaceWorm_joyEndY = e.changedTouches[0].pageY; spaceWorm_joyMove(); e.preventDefault()
  })
  // remove touch events
  spaceWorm_canvas.addEventListener('touchend', spaceWorm_joyEnd)
  // get position of mouse down
  spaceWorm_canvas.addEventListener('mousedown', (e) => {
    spaceWorm_joyStartX = e.clientX; spaceWorm_joyStartY = e.clientY; spaceWorm_joyStart()
  })
  // track where mouse moves to while down
  spaceWorm_canvas.addEventListener('mousemove', (e) => {
    spaceWorm_joyEndX = e.clientX; spaceWorm_joyEndY = e.clientY; spaceWorm_joyMove()
  })
  // remove mouse events on mouse leaving the page and when mouse up
  spaceWorm_canvas.addEventListener('mouseleave', spaceWorm_joyEnd)
  spaceWorm_canvas.addEventListener('mouseup', spaceWorm_joyEnd)

  // check resize and rescale - we'making a square in the middle of the canvas 64x64 and then scaling from there - allowing for the window to display extra space if needed. We're also checking device pixel ration to make it look good on hi res screens
  function spaceWorm_displayWindowSize() {
    spaceWorm_deviceWidth = window.innerWidth
    spaceWorm_deviceHeight = window.innerHeight

    // update HiDPI scale
    spaceWorm_scale = window.devicePixelRatio
    // normally scaling for HiDPI would be as simple as this but it's complicated due to our scaling already in place:
    // canvas.style.width=window.innerWidth
    // canvas.style.height=window.innerHeight
    // canvas.width=window.innerWidth*scale
    // canvas.height=window.innerHeight*scale
    // ctx.scale(scale,scale)

    spaceWorm_scaleFitNative = Math.min((spaceWorm_deviceWidth / spaceWorm_nativeWidth), (spaceWorm_deviceHeight / spaceWorm_nativeHeight))

    spaceWorm_canvas.style.width = spaceWorm_deviceWidth + 'px'
    spaceWorm_canvas.style.height = spaceWorm_deviceHeight + 'px'

    spaceWorm_canvas.width = spaceWorm_deviceWidth * spaceWorm_scale
    spaceWorm_canvas.height = spaceWorm_deviceHeight * spaceWorm_scale

    // spaceWorm_canvas.width = spaceWorm_deviceWidth;
    // spaceWorm_canvas.height = spaceWorm_deviceHeight;

    if (spaceWorm_canvas.width > spaceWorm_canvas.height) {
      spaceWorm_commonUnit = spaceWorm_canvas.width
    } else {
      spaceWorm_commonUnit = spaceWorm_canvas.height
    }

    spaceWorm_ctx.setTransform(
      spaceWorm_scaleFitNative * spaceWorm_scale, 0,
      0, spaceWorm_scaleFitNative * spaceWorm_scale,
      Math.floor(spaceWorm_deviceWidth / 2) * spaceWorm_scale,
      Math.floor(spaceWorm_deviceHeight / 2) * spaceWorm_scale,
    )

    spaceWorm_createBg()
  }

  // functions for controls
  function spaceWorm_joyStart() {
    if (spaceWorm_state === 'levelstart') {
      // reset stuff and start the level
      spaceWorm_score = 0
      spaceWorm_worldX = 0
      spaceWorm_worldY = 0
      spaceWorm_levels()
      spaceWorm_createBg()
      spaceWorm_vx = 0
      spaceWorm_vy = 0
      spaceWorm_joyDistance = 0
      updateGameState('game')
    }
    if (spaceWorm_state === 'game') {
      spaceWorm_joyEndX = spaceWorm_joyStartX
      spaceWorm_joyEndY = spaceWorm_joyStartY
      spaceWorm_mouseMove = false
      spaceWorm_mouseDown = true
      spaceWorm_drawJoy = true
    }
    if (spaceWorm_state === 'gameover') {
      updateGameState('start')
    }
    if (spaceWorm_state === 'win') {
      updateGameState('levelstart')
    }
    if (spaceWorm_state === 'start') {
      // play a silent note to start the audio context on iOS
      spaceWorm_playerlayNote(0, 0, 0, 0, 0)
      updateGameState('levelstart')
    }
  }

  function spaceWorm_joyMove() {
    spaceWorm_mouseMove = true
    if (spaceWorm_mouseDown === true) {
      const spaceWorm_targetX = spaceWorm_joyEndX - spaceWorm_joyStartX
      const spaceWorm_targetY = spaceWorm_joyEndY - spaceWorm_joyStartY
      // calculate joystick knob angle
      spaceWorm_joyAngle = Math.atan2(spaceWorm_targetY, spaceWorm_targetX)
      // calculate joystick knob distance
      spaceWorm_joyDistance = Math.sqrt((spaceWorm_joyStartX - spaceWorm_joyEndX) * (spaceWorm_joyStartX - spaceWorm_joyEndX) + (spaceWorm_joyStartY - spaceWorm_joyEndY) * (spaceWorm_joyStartY - spaceWorm_joyEndY))

      // dividing the speed gives us more control over how far from the joystick base acceleration happens
      spaceWorm_joyDistance = spaceWorm_joyDistance / 3

      // limit distance to limit speed
      if (spaceWorm_joyDistance > spaceWorm_maxspeed) {
        spaceWorm_joyDistance = spaceWorm_maxspeed
      }
    }
  }

  function spaceWorm_joyEnd() {
    // remove mouse/touch
    spaceWorm_mouseDown = false
    spaceWorm_mouseMove = false
    spaceWorm_drawJoy = false
  }

  function spaceWorm_drawJoystick() {
    // draw the joysticks
    spaceWorm_ctx.globalAlpha = 0.5
    spaceWorm_ctx.fillStyle = 'white'

    // joystick base
    spaceWorm_ctx.beginPath()
    spaceWorm_ctx.arc(
      (spaceWorm_joyStartX - (spaceWorm_deviceWidth / 2)) / spaceWorm_scaleFitNative,
      (spaceWorm_joyStartY - (spaceWorm_deviceHeight / 2)) / spaceWorm_scaleFitNative,
      4, 0, 2 * Math.PI)
    spaceWorm_ctx.fill()

    // joystick knob
    spaceWorm_ctx.beginPath()
    spaceWorm_ctx.arc(
      (spaceWorm_joyEndX - (spaceWorm_deviceWidth / 2)) / spaceWorm_scaleFitNative,
      (spaceWorm_joyEndY - (spaceWorm_deviceHeight / 2)) / spaceWorm_scaleFitNative,
      2, 0, 2 * Math.PI)
    spaceWorm_ctx.fill()
    spaceWorm_ctx.globalAlpha = 1
  }

  // functions for objects
  function spaceWorm_playerComponent() {
    this.width = 1
    this.speed = 1
    this.x = 0
    this.y = 0
    this.update = function() {
      // check for collision vs walls
      spaceWorm_levelObstacles.forEach(obj => {
        obj.collision()
      })

      // draw body
      spaceWorm_ctx.fillStyle = 'black'
      spaceWorm_ctx.beginPath()
      spaceWorm_ctx.arc(0, 0, this.width, 0, 2 * Math.PI)
      spaceWorm_ctx.fill()

      // draw and update tail
      spaceWorm_tailComponent.push(new spaceWorm_tail(spaceWorm_player.x - spaceWorm_worldX, spaceWorm_player.y - spaceWorm_worldY))
      spaceWorm_tailComponent.forEach(spaceWorm_tail => {
        spaceWorm_tail.update()
      })

      // draw and update eye
      spaceWorm_ctx.fillStyle = 'white'
      spaceWorm_ctx.beginPath()
      spaceWorm_ctx.arc(this.x + (Math.cos(spaceWorm_joyAngle) * ((this.width / 2) * spaceWorm_joyDistance / 16)), this.y + (Math.sin(spaceWorm_joyAngle) * ((this.width / 2) * spaceWorm_joyDistance / 16)), this.width / 4, 0, 2 * Math.PI)
      spaceWorm_ctx.fill()
    }
  }

  function spaceWorm_tail(x, y) {
    this.width = spaceWorm_player.width
    this.x = x
    this.y = y
    this.maxLife = 100
    this.life = 0
    this.update = function() {
      spaceWorm_ctx.fillStyle = 'black'
      spaceWorm_ctx.beginPath()
      spaceWorm_ctx.arc(spaceWorm_worldX + this.x, spaceWorm_worldY + this.y, this.width, 0, 2 * Math.PI)
      spaceWorm_ctx.fill()
      this.life++
      if (this.life >= this.maxLife) {
        // delete this tail bit after end of life - shift removes the first in the array so that will be the last one created
        spaceWorm_tailComponent.shift()
      }
      // we don't actually need this - we could explicitly declare the width in the arc above but leaving this in for future reference and possible changes
      this.width = this.width - (spaceWorm_player.width / (this.maxLife))
    }
  }

  function spaceWorm_killerCircle(width, x, y, dx, dy) {
    this.width = width
    this.x = x
    this.y = y

    this.dx = dx
    this.dy = dy

    this.isplaying = false
    this.update = function() {
      // collide with level bounds
      if (this.x < spaceWorm_worldBoundsX + 2) {
        this.dx = -this.dx
      }
      if (this.x > spaceWorm_worldBoundsX + spaceWorm_worldBoundsWidth - 2) {
        this.dx = -this.dx
      }
      if (this.y < spaceWorm_worldBoundsY + 2) {
        this.dy = -this.dy
      }
      if (this.y > spaceWorm_worldBoundsY + spaceWorm_worldBoundsHeight - 2) {
        this.dy = -this.dy
      }

      // collide with walls
      spaceWorm_levelObstacles.forEach(obj => {
        spaceWorm_rectangleCollisionVsOther(obj, this)
        const side = spaceWorm_rectangleCollisionVsOther(obj, this)
        if (side === 'top' || side === 'bottom') {
          this.dy = -this.dy
        }
        if (side === 'right' || side === 'left') {
          this.dx = -this.dx
        }
      })

      this.x = this.x + this.dx
      this.y = this.y + this.dy
      spaceWorm_ctx.fillStyle = 'firebrick'
      spaceWorm_ctx.beginPath()
      spaceWorm_ctx.arc(spaceWorm_worldX + this.x, spaceWorm_worldY + this.y, this.width, 0, 2 * Math.PI)
      spaceWorm_ctx.fill()
      if (spaceWorm_circleCollision(this, spaceWorm_player)) {
        updateGameState('gameover')
        if (this.isplaying === false) {
          this.isplaying = true
        }
      } else {
        this.isplaying = false
      }
    }
  }

  function spaceWorm_star(width, x, y) {
    this.width = width
    this.x = x
    this.y = y

    this.isplaying = false
    // assign a note to each star
    this.note = spaceWorm_cNotes[Math.floor(Math.random() * spaceWorm_cNotes.length)]
    this.update = function() {
      let rot = Math.PI / 2 * 3
      this.cx = spaceWorm_worldX + this.x
      this.cy = spaceWorm_worldY + this.y
      const step = Math.PI / 5

      spaceWorm_ctx.beginPath()
      spaceWorm_ctx.moveTo(this.cx, this.cy - this.width)
      for (let i = 0; i < 5; i++) {
        x = this.cx + Math.cos(rot) * this.width
        y = this.cy + Math.sin(rot) * this.width
        spaceWorm_ctx.lineTo(x, y)
        rot += step

        x = this.cx + Math.cos(rot) * this.width / 2
        y = this.cy + Math.sin(rot) * this.width / 2
        spaceWorm_ctx.lineTo(x, y)
        rot += step
      }
      spaceWorm_ctx.lineTo(this.cx, this.cy - this.width)
      spaceWorm_ctx.closePath()
      spaceWorm_ctx.fillStyle = 'gold'
      spaceWorm_ctx.fill()

      // collide with walls - using this to delete collectibles that are covered by walls and update stars remaining
      spaceWorm_levelObstacles.forEach(obj => {
        spaceWorm_rectangleCollisionVsOther(obj, this)
        const side = spaceWorm_rectangleCollisionVsOther(obj, this)
        if (side === 'top' || side === 'right' || side === 'bottom' || side === 'left') {
          spaceWorm_score++
          // this is a terrible idea but I couldn't work out how to identify and delete this "star" from the array so I just deleted the x instead...
          delete this.x
        }
      })

      // collision with player
      if (spaceWorm_circleCollision(this, spaceWorm_player)) {
        spaceWorm_score++
        gameEvents.emit('currentStageScoreIncreased')
        delete this.x

        if (this.isplaying === false) {
          // (note,attack,sustain,release,length)
          spaceWorm_playerlayNote(this.note, 0.01, 0.5, 0.25, 0.5)
          // arpeggio the note - the pitch isn't perfect but it will do... Also set timeout isn't good for audio - one to sort out post jam
          // if we need major/minor and diminished - not using at the moment but keeping in as may be used in an update
          if (this.note === 440 || this.note === 587.33 || this.note === 659.25 || this.note === 880) {
            setTimeout(() => { spaceWorm_playerlayNote(this.note * 1.19, 0.02, 0.5, 0.25, 0.5) }, 150)
            setTimeout(() => { spaceWorm_playerlayNote(this.note * 1.5, 0.01, 0.5, 0.25, 0.5) }, 300)
            setTimeout(() => { spaceWorm_playerlayNote(this.note * 2, 0.01, 0.5, 0.25, 0.5) }, 450)
          } else if (this.note === 493.88) {
            setTimeout(() => { spaceWorm_playerlayNote(this.note * 1.19, 0.02, 0.5, 0.25, 0.5) }, 150)
            setTimeout(() => { spaceWorm_playerlayNote(this.note * 1.414, 0.01, 0.5, 0.25, 0.5) }, 300)
            setTimeout(() => { spaceWorm_playerlayNote(this.note * 2, 0.01, 0.5, 0.25, 0.5) }, 450)
          } else {
            setTimeout(() => { spaceWorm_playerlayNote(this.note * 1.25, 0.02, 0.5, 0.25, 0.5) }, 150)
            setTimeout(() => { spaceWorm_playerlayNote(this.note * 1.5, 0.01, 0.5, 0.25, 0.5) }, 300)
            setTimeout(() => { spaceWorm_playerlayNote(this.note * 2, 0.01, 0.5, 0.25, 0.5) }, 450)
          }

          // make the note play once
          this.isplaying = true
        }
      } else {
        // resetting to allow the note to play again on a future collision
        this.isplaying = false
      }
    }
  }

  function spaceWorm_bgStar(width, x, y) {
    this.width = width
    this.x = x
    this.y = y

    this.dx = (Math.random() * 0.02) - 0.01
    this.dy = (Math.random() * 0.02) - 0.01

    this.isplaying = false
    // assign a note to each star
    this.note = spaceWorm_bgNotes[Math.floor(Math.random() * spaceWorm_bgNotes.length)]
    this.update = function() {
      // stars that go off screen reappear the other side
      if (this.x > -spaceWorm_worldX + (spaceWorm_canvas.width / spaceWorm_scaleFitNative / 2)) {
        this.x = -spaceWorm_worldX - (spaceWorm_canvas.width / spaceWorm_scaleFitNative / 2)
      }
      if (this.x < -spaceWorm_worldX - (spaceWorm_canvas.width / spaceWorm_scaleFitNative / 2)) {
        this.x = -spaceWorm_worldX + (spaceWorm_canvas.width / spaceWorm_scaleFitNative / 2)
      }
      if (this.y > -spaceWorm_worldY + (spaceWorm_canvas.height / spaceWorm_scaleFitNative / 2)) {
        this.y = -spaceWorm_worldY - (spaceWorm_canvas.height / spaceWorm_scaleFitNative / 2)
      }
      if (this.y < -spaceWorm_worldY - (spaceWorm_canvas.height / spaceWorm_scaleFitNative / 2)) {
        this.y = -spaceWorm_worldY + (spaceWorm_canvas.height / spaceWorm_scaleFitNative / 2)
      }

      this.x = this.x + this.dx
      this.y = this.y + this.dy
      spaceWorm_ctx.globalAlpha = 0.2
      spaceWorm_ctx.fillStyle = 'white'
      spaceWorm_ctx.beginPath()
      spaceWorm_ctx.arc(spaceWorm_worldX + this.x, spaceWorm_worldY + this.y, this.width, 0, 2 * Math.PI)
      spaceWorm_ctx.fill()
      spaceWorm_ctx.globalAlpha = 1
      if (spaceWorm_circleCollision(this, spaceWorm_player)) {
        if (this.isplaying === false) {
          spaceWorm_playerlayNote(this.note, 1, 0.5, 1, 2)
          this.isplaying = true
        }
      } else {
        this.isplaying = false
      }
    }
  }

  function spaceWorm_rectangle(width, height, x, y) {
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.update = function() {
      spaceWorm_ctx.fillStyle = 'black'
      spaceWorm_ctx.fillRect(this.x + spaceWorm_worldX, this.y + spaceWorm_worldY, this.width, this.height)
    }
    this.collision = function() {
      // collision with walls - this is over complicated as I'm a noob...
      spaceWorm_rectangleCollisionVsPlayer(this, spaceWorm_player)
      const side = spaceWorm_rectangleCollisionVsPlayer(this, spaceWorm_player)
      // reverse edge for collision
      if (side === 'none') {
      }
      if (side === 'top') {
        // I had issues with tunnelling at the corners - this is my hack for it though there will be a better way if I look at the logic properly. This is repeated for each edge.
        if (spaceWorm_oldWorldY > spaceWorm_worldY) {
          spaceWorm_oldWorldY = spaceWorm_worldY
        }
        spaceWorm_worldY = spaceWorm_oldWorldY
      }
      if (side === 'right') {
        if (spaceWorm_oldWorldX < spaceWorm_worldX) {
          spaceWorm_oldWorldX = spaceWorm_worldX
        }
        spaceWorm_worldX = spaceWorm_oldWorldX
      }
      if (side === 'bottom') {
        if (spaceWorm_oldWorldY < spaceWorm_worldY) {
          spaceWorm_oldWorldY = spaceWorm_worldY
        }
        spaceWorm_worldY = spaceWorm_oldWorldY
      }
      if (side === 'left') {
        if (spaceWorm_oldWorldX > spaceWorm_worldX) {
          spaceWorm_oldWorldX = spaceWorm_worldX
        }
        spaceWorm_worldX = spaceWorm_oldWorldX
      }
    }
  }

  function spaceWorm_killerRectangle(width, height, x, y) {
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.update = function() {
      spaceWorm_ctx.fillStyle = 'firebrick'
      spaceWorm_ctx.fillRect(this.x + spaceWorm_worldX, this.y + spaceWorm_worldY, this.width, this.height)
    }
    this.collision = function() {
      spaceWorm_rectangleCollisionVsPlayer(this, spaceWorm_player)
      const side = spaceWorm_rectangleCollisionVsPlayer(this, spaceWorm_player)
      if (side === 'top' || side === 'right' || side === 'bottom' || side === 'left') {
        updateGameState('gameover')
      }
    }
  }

  // level variables
  function spaceWorm_levels() {
    // there will be an easier way of doing the spaceWorm_levels - putting the function to create in another function...
    // reset stuff:
    spaceWorm_tailComponent = []
    spaceWorm_levelObstacles = []
    spaceWorm_enemies = []
    spaceWorm_stars = []

    // level 1
    if (spaceWorm_level === 1) {
      // worldbounds
      spaceWorm_worldBoundsX = -3 * 16
      spaceWorm_worldBoundsY = -3 * 16
      spaceWorm_worldBoundsWidth = 6 * 16
      spaceWorm_worldBoundsHeight = 6 * 16

      spaceWorm_levelObstacles = []
      spaceWorm_walls = []
      spaceWorm_killerWalls = []
      spaceWorm_enemies = []

      spaceWorm_stars = []
      const NUM_COLS = 3
      const NUM_ROWS = 3
      for (let i = 0; i < NUM_COLS; i++) {
        for (let j = 0; j < NUM_ROWS; j++) {
          const width = 2
          let x = (i * 32) + spaceWorm_worldBoundsX + 16
          const y = (j * 32) + spaceWorm_worldBoundsX + 16
          if (x === 0 && y === 0) {
            x = spaceWorm_worldBoundsWidth
            spaceWorm_score++
          }
          spaceWorm_stars.push(new spaceWorm_star(width, x, y))
        }
      }
    }

    // level 2
    if (spaceWorm_level === 2) {
      // worldbounds
      spaceWorm_worldBoundsX = -5 * 16
      spaceWorm_worldBoundsY = -5 * 16
      spaceWorm_worldBoundsWidth = 10 * 16
      spaceWorm_worldBoundsHeight = 10 * 16

      spaceWorm_levelObstacles = []
      spaceWorm_killerWalls = []
      spaceWorm_enemies = []

      spaceWorm_walls = []
      spaceWorm_walls = [
        { x: 2, y: 2, w: 2, h: 2 },
        { x: 6, y: 2, w: 2, h: 2 },
        { x: 2, y: 6, w: 2, h: 2 },
        { x: 6, y: 6, w: 2, h: 2 },
      ]
      for (let i = 0; i < spaceWorm_walls.length; i++) {
        const width = spaceWorm_walls[i].w * 16
        const height = spaceWorm_walls[i].h * 16
        const x = (spaceWorm_walls[i].x) * 16 - (spaceWorm_worldBoundsWidth / 2)
        const y = (spaceWorm_walls[i].y) * 16 - (spaceWorm_worldBoundsHeight / 2)
        spaceWorm_levelObstacles.push(new spaceWorm_rectangle(width, height, x, y))
      }

      spaceWorm_stars = []
      const NUM_COLS = 5
      const NUM_ROWS = 5
      for (let i = 0; i < NUM_COLS; i++) {
        for (let j = 0; j < NUM_ROWS; j++) {
          const width = 2
          let x = (i * 32) + spaceWorm_worldBoundsX + 16
          const y = (j * 32) + spaceWorm_worldBoundsX + 16
          if (x === 0 && y === 0) {
            x = spaceWorm_worldBoundsWidth
            spaceWorm_score++
          }
          spaceWorm_stars.push(new spaceWorm_star(width, x, y))
        }
      }
    }

    // spaceWorm_level 3
    if (spaceWorm_level === 3) {
      // worldbounds
      spaceWorm_worldBoundsX = -4 * 16
      spaceWorm_worldBoundsY = -4 * 16
      spaceWorm_worldBoundsWidth = 8 * 16
      spaceWorm_worldBoundsHeight = 8 * 16

      spaceWorm_levelObstacles = []
      spaceWorm_walls = []
      spaceWorm_killerWalls = []

      spaceWorm_enemies = []
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 2 * 16, 0, 0, 0.5))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, -2 * 16, 0, 0, -0.5))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 0, 2 * 16, -0.5, 0))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 0, -2 * 16, 0.5, 0))

      spaceWorm_stars = []
      const NUM_COLS = 4
      const NUM_ROWS = 4
      for (let i = 0; i < NUM_COLS; i++) {
        for (let j = 0; j < NUM_ROWS; j++) {
          const width = 2
          let x = (i * 32) + spaceWorm_worldBoundsX + 16
          const y = (j * 32) + spaceWorm_worldBoundsX + 16
          if (x === 0 && y === 0) {
            x = spaceWorm_worldBoundsWidth
            spaceWorm_score++
          }
          spaceWorm_stars.push(new spaceWorm_star(width, x, y))
        }
      }
    }

    // spaceWorm_level 4
    if (spaceWorm_level === 4) {
      // world bounds
      spaceWorm_worldBoundsX = -4.5 * 16
      spaceWorm_worldBoundsY = -4.5 * 16
      spaceWorm_worldBoundsWidth = 9 * 16
      spaceWorm_worldBoundsHeight = 9 * 16

      spaceWorm_walls = []
      spaceWorm_walls = [
        { x: 0, y: 0, w: 2, h: 2 },
        { x: 7, y: 0, w: 2, h: 2 },
        { x: 0, y: 7, w: 2, h: 2 },
        { x: 7, y: 7, w: 2, h: 2 },
      ]
      for (let i = 0; i < spaceWorm_walls.length; i++) {
        const width = spaceWorm_walls[i].w * 16
        const height = spaceWorm_walls[i].h * 16
        const x = (spaceWorm_walls[i].x) * 16 - (spaceWorm_worldBoundsWidth / 2)
        const y = (spaceWorm_walls[i].y) * 16 - (spaceWorm_worldBoundsHeight / 2)
        spaceWorm_levelObstacles.push(new spaceWorm_rectangle(width, height, x, y))
      }

      spaceWorm_killerWalls = []
      spaceWorm_killerWalls = [
        { x: 3, y: 1, w: 3, h: 1 },
        { x: 1, y: 3, w: 1, h: 3 },
        { x: 3, y: 7, w: 3, h: 1 },
        { x: 7, y: 3, w: 1, h: 3 },
      ]
      for (let i = 0; i < spaceWorm_killerWalls.length; i++) {
        const width = spaceWorm_killerWalls[i].w * 16
        const height = spaceWorm_killerWalls[i].h * 16
        const x = (spaceWorm_killerWalls[i].x) * 16 - (spaceWorm_worldBoundsWidth / 2)
        const y = (spaceWorm_killerWalls[i].y) * 16 - (spaceWorm_worldBoundsHeight / 2)
        spaceWorm_levelObstacles.push(new spaceWorm_killerRectangle(width, height, x, y))
      }

      spaceWorm_stars = []
      const NUM_COLS = 5
      const NUM_ROWS = 5
      for (let i = 0; i < NUM_COLS; i++) {
        for (let j = 0; j < NUM_ROWS; j++) {
          const width = 2
          let x = (i * 32) + spaceWorm_worldBoundsX + 8
          const y = (j * 32) + spaceWorm_worldBoundsX + 8
          if (x === 0 && y === 0) {
            x = spaceWorm_worldBoundsWidth
            spaceWorm_score++
          }
          spaceWorm_stars.push(new spaceWorm_star(width, x, y))
        }
      }
    }

    // spaceWorm_level 5
    if (spaceWorm_level === 5) {
      spaceWorm_worldBoundsX = -1.5 * 16
      spaceWorm_worldBoundsY = -2.5 * 16
      spaceWorm_worldBoundsWidth = 29 * 16
      spaceWorm_worldBoundsHeight = 5 * 16

      spaceWorm_levelObstacles = []

      spaceWorm_walls = []
      spaceWorm_walls = [
        { x: 0, y: 0, w: 3, h: 1 },
        { x: 0, y: 4, w: 3, h: 1 },
        { x: 3, y: 0, w: 3, h: 2 },
        { x: 3, y: 3, w: 3, h: 2 },
        { x: 14, y: 0, w: 1, h: 1 },
        { x: 14, y: 4, w: 1, h: 1 },
        { x: 15, y: 0, w: 1, h: 2 },
        { x: 15, y: 3, w: 1, h: 2 },

        { x: 21, y: 0, w: 1, h: 2 },
        { x: 21, y: 3, w: 1, h: 2 },
        { x: 22, y: 0, w: 7, h: 1 },
        { x: 22, y: 4, w: 7, h: 1 },

        { x: 23, y: 0, w: 1, h: 2 },
        { x: 25, y: 3, w: 1, h: 2 },
        { x: 27, y: 0, w: 1, h: 2 },
      ]
      for (let i = 0; i < spaceWorm_walls.length; i++) {
        const width = spaceWorm_walls[i].w * 16
        const height = spaceWorm_walls[i].h * 16
        const x = (spaceWorm_walls[i].x) * 16 + spaceWorm_worldBoundsX
        const y = (spaceWorm_walls[i].y) * 16 + spaceWorm_worldBoundsY
        spaceWorm_levelObstacles.push(new spaceWorm_rectangle(width, height, x, y))
      }

      spaceWorm_killerWalls = []
      spaceWorm_killerWalls = [
        { x: 11, y: 0, w: 3, h: 2 },
        { x: 11, y: 3, w: 3, h: 2 },
        { x: 18, y: 2, w: 1, h: 1 },
        { x: 23, y: 2, w: 1, h: 1 },
        { x: 25, y: 2, w: 1, h: 1 },
        { x: 27, y: 2, w: 1, h: 1 },
      ]
      for (let i = 0; i < spaceWorm_killerWalls.length; i++) {
        const width = spaceWorm_killerWalls[i].w * 16
        const height = spaceWorm_killerWalls[i].h * 16
        const x = (spaceWorm_killerWalls[i].x) * 16 + spaceWorm_worldBoundsX
        const y = (spaceWorm_killerWalls[i].y) * 16 + spaceWorm_worldBoundsY
        spaceWorm_levelObstacles.push(new spaceWorm_killerRectangle(width, height, x, y))
      }

      spaceWorm_enemies = []
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 13 * 16, 0, 0, 0.5))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 1 * 16, 0, 0, 0.5))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, -1 * 16, 0, 0, -0.5))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 0, 1 * 16, -0.5, 0))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 0, -1 * 16, 0.5, 0))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 8 * 16, 0, 0, 0.5))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 6 * 16, 0, 0, -0.5))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 7 * 16, 1 * 16, -0.5, 0))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 7 * 16, -1 * 16, 0.5, 0))

      spaceWorm_stars = []
      const NUM_COLS = 15
      const NUM_ROWS = 3
      for (let i = 0; i < NUM_COLS; i++) {
        for (let j = 0; j < NUM_ROWS; j++) {
          const width = 2
          let x = (i * 32) + spaceWorm_worldBoundsX + 8
          const y = (j * 32) + spaceWorm_worldBoundsY + 8
          if (x < 32) {
            x = -spaceWorm_worldBoundsWidth
            spaceWorm_score++
          }
          spaceWorm_stars.push(new spaceWorm_star(width, x, y))
        }
      }
    }

    // spaceWorm_level 6
    if (spaceWorm_level === 6) {
      spaceWorm_worldBoundsX = -7.5 * 16
      spaceWorm_worldBoundsY = -7.5 * 16
      spaceWorm_worldBoundsWidth = 15 * 16
      spaceWorm_worldBoundsHeight = 15 * 16

      spaceWorm_walls = []
      spaceWorm_walls = [
        { x: 7, y: 1, w: 1, h: 1 },
        { x: 7, y: 13, w: 1, h: 1 },
        { x: 1, y: 7, w: 1, h: 1 },
        { x: 13, y: 7, w: 1, h: 1 },
      ]
      for (let i = 0; i < spaceWorm_walls.length; i++) {
        const width = spaceWorm_walls[i].w * 16
        const height = spaceWorm_walls[i].h * 16
        const x = spaceWorm_walls[i].x * 16 - (spaceWorm_worldBoundsWidth / 2)
        const y = spaceWorm_walls[i].y * 16 - (spaceWorm_worldBoundsHeight / 2)
        spaceWorm_levelObstacles.push(new spaceWorm_rectangle(width, height, x, y))
      }

      spaceWorm_killerWalls = []
      spaceWorm_killerWalls = [
        { x: 0, y: 0, w: 6, h: 6 },
        { x: 9, y: 0, w: 6, h: 6 },
        { x: 0, y: 9, w: 6, h: 6 },
        { x: 9, y: 9, w: 6, h: 6 },

        { x: 5, y: 3, w: 2, h: 1 },
        { x: 8, y: 3, w: 2, h: 1 },

        { x: 5, y: 11, w: 2, h: 1 },
        { x: 8, y: 11, w: 2, h: 1 },

        { x: 3, y: 5, w: 1, h: 2 },
        { x: 3, y: 8, w: 1, h: 2 },

        { x: 11, y: 5, w: 1, h: 2 },
        { x: 11, y: 8, w: 1, h: 2 },
      ]
      for (let i = 0; i < spaceWorm_killerWalls.length; i++) {
        const width = spaceWorm_killerWalls[i].w * 16
        const height = spaceWorm_killerWalls[i].h * 16
        const x = (spaceWorm_killerWalls[i].x) * 16 + spaceWorm_worldBoundsX
        const y = (spaceWorm_killerWalls[i].y) * 16 + spaceWorm_worldBoundsY
        spaceWorm_levelObstacles.push(new spaceWorm_killerRectangle(width, height, x, y))
      }

      spaceWorm_stars = []
      const NUM_COLS = 8
      const NUM_ROWS = 8
      for (let i = 0; i < NUM_COLS; i++) {
        for (let j = 0; j < NUM_ROWS; j++) {
          const width = 2
          const x = (i * 32) + spaceWorm_worldBoundsX + 8
          const y = (j * 32) + spaceWorm_worldBoundsY + 8
          spaceWorm_stars.push(new spaceWorm_star(width, x, y))
        }
      }

      spaceWorm_enemies = []
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 7.5 * 16 - (spaceWorm_worldBoundsWidth / 2), 5.5 * 16 - (spaceWorm_worldBoundsHeight / 2), 0.5, 0))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 7.5 * 16 - (spaceWorm_worldBoundsWidth / 2), 9.5 * 16 - (spaceWorm_worldBoundsHeight / 2), -0.5, 0))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 5.5 * 16 - (spaceWorm_worldBoundsWidth / 2), 7.5 * 16 - (spaceWorm_worldBoundsHeight / 2), 0, -0.5))
      spaceWorm_enemies.push(new spaceWorm_killerCircle(2, 9.5 * 16 - (spaceWorm_worldBoundsWidth / 2), 7.5 * 16 - (spaceWorm_worldBoundsHeight / 2), 0, 0.5))
    }

    // spaceWorm_level 7
    if (spaceWorm_level === 7) {
      spaceWorm_worldBoundsX = -6.5 * 16
      spaceWorm_worldBoundsY = -6.5 * 16
      spaceWorm_worldBoundsWidth = 13 * 16
      spaceWorm_worldBoundsHeight = 13 * 16

      spaceWorm_walls = []

      spaceWorm_walls = [
        { x: 3, y: 1, w: 1, h: 2 },
        { x: 5, y: 2, w: 3, h: 1 },
        { x: 9, y: 1, w: 1, h: 2 },
        { x: 1, y: 2, w: 1, h: 3 },
        { x: 0, y: 4, w: 1, h: 1 },
        { x: 3, y: 4, w: 3, h: 1 },
        { x: 11, y: 2, w: 1, h: 3 },
        { x: 12, y: 4, w: 1, h: 1 },
        { x: 7, y: 4, w: 3, h: 1 },

        { x: 0, y: 6, w: 2, h: 1 },
        { x: 11, y: 6, w: 2, h: 1 },

        { x: 3, y: 10, w: 1, h: 2 },
        { x: 5, y: 10, w: 3, h: 1 },
        { x: 9, y: 10, w: 1, h: 2 },
        { x: 1, y: 9, w: 1, h: 2 },
        { x: 0, y: 8, w: 2, h: 1 },
        { x: 3, y: 8, w: 3, h: 1 },
        { x: 11, y: 9, w: 1, h: 2 },
        { x: 11, y: 8, w: 2, h: 1 },
        { x: 7, y: 8, w: 3, h: 1 },
      ]

      for (let i = 0; i < spaceWorm_walls.length; i++) {
        const width = spaceWorm_walls[i].w * 16
        const height = spaceWorm_walls[i].h * 16
        const x = (spaceWorm_walls[i].x) * 16 + spaceWorm_worldBoundsX
        const y = (spaceWorm_walls[i].y) * 16 + spaceWorm_worldBoundsY
        spaceWorm_levelObstacles.push(new spaceWorm_rectangle(width, height, x, y))
      }

      spaceWorm_stars = []
      const NUM_COLS = 7
      const NUM_ROWS = 7
      for (let i = 0; i < NUM_COLS; i++) {
        for (let j = 0; j < NUM_ROWS; j++) {
          const width = 2
          let x = (i * 32) + spaceWorm_worldBoundsX + 8
          const y = (j * 32) + spaceWorm_worldBoundsX + 8
          if (x === 0 && y === 0) {
            x = spaceWorm_worldBoundsWidth
            spaceWorm_score++
          }
          spaceWorm_stars.push(new spaceWorm_star(width, x, y))
        }
      }

      spaceWorm_killerWalls = []
      spaceWorm_killerWalls = [
        { x: 3, y: 6, w: 1, h: 1 },
        { x: 9, y: 6, w: 1, h: 1 },
        { x: 6, y: 1, w: 1, h: 1 },
        { x: 6, y: 11, w: 1, h: 1 },

        { x: 0, y: 0, w: 1, h: 1 },
        { x: 0, y: 12, w: 1, h: 1 },
        { x: 12, y: 0, w: 1, h: 1 },
        { x: 12, y: 12, w: 1, h: 1 },
      ]
      for (let i = 0; i < spaceWorm_killerWalls.length; i++) {
        const width = spaceWorm_killerWalls[i].w * 16
        const height = spaceWorm_killerWalls[i].h * 16
        const x = (spaceWorm_killerWalls[i].x) * 16 + spaceWorm_worldBoundsX
        const y = (spaceWorm_killerWalls[i].y) * 16 + spaceWorm_worldBoundsY
        spaceWorm_levelObstacles.push(new spaceWorm_killerRectangle(width, height, x, y))
      }

      spaceWorm_enemies = []
      for (let i = 0; i < 10; i++) {
        const width = 2
        const x = (Math.floor(Math.random() * (spaceWorm_worldBoundsWidth - 32)) + (spaceWorm_worldBoundsX + 16))
        let y = -96
        const dx = (Math.random() * 1) - 0.5
        const dy = (Math.random() * 1) - 0.5
        if (i > 4) {
          y = 96
        }
        spaceWorm_enemies.push(new spaceWorm_killerCircle(width, x, y, dx, dy))
      }
    }
  }

  // collisions
  // I've used 2 rectangle collisions - one to account for player being centered. I probably don't need 2 and could handle it in the logic being passed to the function or something - for after the jam
  function spaceWorm_rectangleCollisionVsPlayer(r1, r2) {
    const dx = (r1.x + r1.width / 2) - ((r2.x) - spaceWorm_worldX)
    const dy = (r1.y + r1.height / 2) - ((r2.y) - spaceWorm_worldY)
    const width = (r1.width + (r2.width * 2)) / 2
    const height = (r1.height + (r2.width * 2)) / 2
    const crossWidth = width * dy
    const crossHeight = height * dx
    let collision = 'none'

    if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
      if (crossWidth > crossHeight) {
        collision = (crossWidth > (-crossHeight)) ? 'bottom' : 'left'
      } else {
        collision = (crossWidth > -(crossHeight)) ? 'right' : 'top'
      }
    }
    return (collision)
  }

  function spaceWorm_rectangleCollisionVsOther(r1, r2) {
    const dx = (r1.x + r1.width / 2) - ((r2.x))
    const dy = (r1.y + r1.height / 2) - ((r2.y))
    const width = (r1.width + (r2.width * 2)) / 2
    const height = (r1.height + (r2.width * 2)) / 2
    const crossWidth = width * dy
    const crossHeight = height * dx
    let collision = 'none'

    if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
      if (crossWidth > crossHeight) {
        collision = (crossWidth > (-crossHeight)) ? 'bottom' : 'left'
      } else {
        collision = (crossWidth > -(crossHeight)) ? 'right' : 'top'
      }
    }
    return (collision)
  }

  function spaceWorm_circleCollision(obj1, obj2) {
    const circle1 = { radius: obj1.width, x: obj1.x, y: obj1.y }
    const circle2 = { radius: obj2.width, x: obj2.x - spaceWorm_worldX, y: obj2.y - spaceWorm_worldY }

    const dx = circle1.x - circle2.x
    const dy = circle1.y - circle2.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < circle1.radius + circle2.radius) {
      // collision detected!
      return true
    }
  }

  function spaceWorm_createBg() {
    spaceWorm_background = []
    for (let i = 0; i < 200; i++) {
      const width = Math.random() * (0.2) + 0.2
      const x = (Math.floor(Math.random() * spaceWorm_canvas.width / spaceWorm_scaleFitNative) - spaceWorm_canvas.width / spaceWorm_scaleFitNative / 2) - spaceWorm_worldX
      const y = (Math.floor(Math.random() * spaceWorm_canvas.height / spaceWorm_scaleFitNative) - spaceWorm_canvas.height / spaceWorm_scaleFitNative / 2) - spaceWorm_worldY
      spaceWorm_background.push(new spaceWorm_bgStar(width, x, y))
    }
  }

  function spaceWorm_update() {
    // clear page
    spaceWorm_ctx.clearRect((-spaceWorm_canvas.width / 2) / spaceWorm_scaleFitNative, (-spaceWorm_canvas.height / 2) / spaceWorm_scaleFitNative, spaceWorm_canvas.width / spaceWorm_scaleFitNative, spaceWorm_canvas.height / spaceWorm_scaleFitNative)

    // different screens based on state
    if (spaceWorm_state === 'start') {
      spaceWorm_ctx.font = '4px Arial'
      spaceWorm_ctx.fillStyle = 'white'
      spaceWorm_ctx.textAlign = 'center'
      spaceWorm_ctx.fillText('SPACE WORM!', 0, 0)

      const rankCellHeight = 1.8
      spaceWorm_ctx.font = `${rankCellHeight * 0.8}px Arial`
      spaceWorm_ctx.fillText('---------------------- TOP 10 ----------------------', 0, 3)
      const rankHeight = 3 + rankCellHeight 
      top10Scores.forEach((score, idx) => {
        spaceWorm_ctx.fillText(`[${score.rank}]\tscore: ${score.score},\tname: ${score.user.displayName}`, 0, rankHeight + (idx * rankCellHeight))
      })
      spaceWorm_ctx.fillText('--------------------------------------------------------', 0, rankHeight + (top10Scores.length * rankCellHeight))
      spaceWorm_ctx.font = '2px Arial'
      spaceWorm_ctx.fillText('Click/tap to continue.', 0, rankHeight + (top10Scores.length * rankCellHeight) + 2)
    } else if (spaceWorm_state === 'levelstart') {
      spaceWorm_ctx.font = '4px Arial'
      spaceWorm_ctx.fillStyle = 'white'
      spaceWorm_ctx.textAlign = 'center'
      spaceWorm_ctx.fillText('Level: ' + spaceWorm_level, 0, -1)
      spaceWorm_ctx.font = '2px Arial'
      if (spaceWorm_level === 1) {
        spaceWorm_ctx.fillText('Collect all of the yellow stars.', 0, 2)
        spaceWorm_ctx.fillText('Touch screen and drag or use mouse to move.', 0, 4)
      }
      if (spaceWorm_level === 2) {
        spaceWorm_ctx.fillText('Black space is impassible.', 0, 2)
        spaceWorm_ctx.fillText('Slow down by not moving the joystick too far.', 0, 4)
      }
      if (spaceWorm_level === 3) {
        spaceWorm_ctx.fillText('Red meteors will destroy you.', 0, 2)
        spaceWorm_ctx.fillText('Your tail is not affected.', 0, 4)
      }
      if (spaceWorm_level === 4) {
        spaceWorm_ctx.fillText('Red space will destroy you.', 0, 2)
        spaceWorm_ctx.fillText("You don't want to be an ex-worm...", 0, 4)
      }
      if (spaceWorm_level === 5) {
        spaceWorm_ctx.fillText("Let's put these things together.", 0, 2)
        spaceWorm_ctx.fillText("Collect all stars, don't be an ex-worm!", 0, 4)
      }
      if (spaceWorm_level === 6) {
        spaceWorm_ctx.fillText('Mind the red space!', 0, 2)
        spaceWorm_ctx.fillText('You may need to check your speed...', 0, 4)
      }
      if (spaceWorm_level === 7) {
        spaceWorm_ctx.fillText("Let's try a maze", 0, 2)
        spaceWorm_ctx.fillText('Be careful enemies now roam the map...', 0, 4)
      }
      spaceWorm_ctx.font = '1px Arial'
      spaceWorm_ctx.fillText('Click/tap to continue.', 0, 6)
    } else if (spaceWorm_state === 'gamecomplete') {
      spaceWorm_ctx.font = '4px Arial'
      spaceWorm_ctx.fillStyle = 'white'
      spaceWorm_ctx.textAlign = 'center'
      spaceWorm_ctx.fillText('CONGRATULATIONS!', 0, 0)
      spaceWorm_ctx.font = '2px Arial'
      spaceWorm_ctx.fillText('You completed my little game!', 0, 4)
    } else if (spaceWorm_state === 'game') {
      // this is the actual game loop

      // update objects
      spaceWorm_background.forEach(obj => {
        obj.update()
      })

      spaceWorm_player.update()

      spaceWorm_stars.forEach(obj => {
        obj.update()
      })

      spaceWorm_enemies.forEach(obj => {
        obj.update()
      })

      spaceWorm_levelObstacles.forEach(obj => {
        obj.update()
      })

      // create black world bounds - more complicated than it should be due to screen scaling and wanting the world bounds to extend to the edge of the screen
      spaceWorm_ctx.strokeStyle = 'black'

      spaceWorm_ctx.lineWidth = spaceWorm_commonUnit / spaceWorm_scaleFitNative
      spaceWorm_ctx.strokeRect(
        (spaceWorm_worldX + spaceWorm_worldBoundsX) - (spaceWorm_commonUnit / 2) / spaceWorm_scaleFitNative,
        (spaceWorm_worldY + spaceWorm_worldBoundsY) - (spaceWorm_commonUnit / 2) / spaceWorm_scaleFitNative,
        spaceWorm_worldBoundsWidth + (spaceWorm_commonUnit) / spaceWorm_scaleFitNative,
        spaceWorm_worldBoundsHeight + (spaceWorm_commonUnit) / spaceWorm_scaleFitNative,
      )

      // record the old world position in case we collide with walls
      spaceWorm_oldWorldX = spaceWorm_worldX
      spaceWorm_oldWorldY = spaceWorm_worldY

      // move player if mousedown/touchdown and has moved
      if (spaceWorm_mouseDown === true && spaceWorm_mouseMove === true) {
        spaceWorm_vx = Math.cos(spaceWorm_joyAngle) * (spaceWorm_joyDistance / 30)
        spaceWorm_vy = Math.sin(spaceWorm_joyAngle) * (spaceWorm_joyDistance / 30)
      }

      // apply friction
      spaceWorm_vx = spaceWorm_vx * spaceWorm_friction
      spaceWorm_vy = spaceWorm_vy * spaceWorm_friction
      // move the world
      spaceWorm_worldX = spaceWorm_worldX - spaceWorm_vx
      spaceWorm_worldY = spaceWorm_worldY - spaceWorm_vy

      // spaceWorm_level bounds
      if (-spaceWorm_worldX - spaceWorm_player.width < spaceWorm_worldBoundsX) {
        spaceWorm_worldX = -spaceWorm_worldBoundsX - spaceWorm_player.width
      }
      if (-spaceWorm_worldY - spaceWorm_player.width < spaceWorm_worldBoundsY) {
        spaceWorm_worldY = -spaceWorm_worldBoundsY - spaceWorm_player.width
      }
      if (-spaceWorm_worldX + spaceWorm_player.width > spaceWorm_worldBoundsX + spaceWorm_worldBoundsWidth) {
        spaceWorm_worldX = -(spaceWorm_worldBoundsX + spaceWorm_worldBoundsWidth) + spaceWorm_player.width
      }
      if (-spaceWorm_worldY + spaceWorm_player.width > spaceWorm_worldBoundsY + spaceWorm_worldBoundsHeight) {
        spaceWorm_worldY = -(spaceWorm_worldBoundsY + spaceWorm_worldBoundsHeight) + spaceWorm_player.width
      }

      if (spaceWorm_drawJoy === true) {
        spaceWorm_drawJoystick()
      }

      // display stars remaining:
      spaceWorm_starsRemaining = spaceWorm_stars.length - spaceWorm_score
      spaceWorm_ctx.font = '4px Arial'
      spaceWorm_ctx.fillStyle = 'white'
      spaceWorm_ctx.textAlign = 'left'
      spaceWorm_ctx.fillText('Stars: ' + spaceWorm_starsRemaining,
        ((-spaceWorm_deviceWidth / 2) + 16) / spaceWorm_scaleFitNative,
        ((-spaceWorm_deviceHeight / 2) + 64) / spaceWorm_scaleFitNative,
      )
      if (spaceWorm_starsRemaining <= 0) {
        spaceWorm_level++
        if (spaceWorm_level === 8) {
          updateGameState('gamecomplete')
        } else {
          updateGameState('win')
        }
      }
    } else if (spaceWorm_state === 'gameover') {
      spaceWorm_ctx.font = '4px Arial'
      spaceWorm_ctx.fillStyle = 'white'
      spaceWorm_ctx.textAlign = 'center'
      spaceWorm_ctx.fillText('Oh no! You got ex-wormed!', 0, 0)
      spaceWorm_ctx.font = '2px Arial'
      spaceWorm_ctx.fillText('Click/tap to restart the level.', 0, 4)
    } else if (spaceWorm_state === 'win') {
      spaceWorm_ctx.font = '4px Arial'
      spaceWorm_ctx.fillStyle = 'white'
      spaceWorm_ctx.textAlign = 'center'
      spaceWorm_ctx.fillText('Well done!', 0, 0)
      spaceWorm_ctx.font = '2px Arial'
      spaceWorm_ctx.fillText('Click/tap to continue.', 0, 4)
    }
    requestAnimationFrame(spaceWorm_update)
  }

  // function for playing sounds
  function spaceWorm_playerlayNote(note, attackTime, sustainspaceWorm_level, releaseTime, noteLength) {
    const osc = spaceWorm_audioCtx.createOscillator()
    const noteGain = spaceWorm_audioCtx.createGain()
    noteGain.gain.setValueAtTime(0, 0)
    noteGain.gain.linearRampToValueAtTime(sustainspaceWorm_level, spaceWorm_audioCtx.currentTime + attackTime)
    noteGain.gain.setValueAtTime(sustainspaceWorm_level, spaceWorm_audioCtx.currentTime + noteLength - releaseTime)
    noteGain.gain.linearRampToValueAtTime(0, spaceWorm_audioCtx.currentTime + noteLength)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(note, 0)
    osc.start(0)
    osc.stop(spaceWorm_audioCtx.currentTime + noteLength)
    osc.connect(noteGain)
    noteGain.connect(spaceWorm_volumeGain)
  }

  window.addEventListener('resize', spaceWorm_displayWindowSize())
  window.onresize = spaceWorm_displayWindowSize
  spaceWorm_update()
}
