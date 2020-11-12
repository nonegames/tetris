import React, { useEffect, useRef, useState } from 'react'
import './icon.css'
import './App.css'
import { Game } from './game'
import Popup from './Popup'
import keycode from 'keycode'

// Game实例
const game = new Game()

function App() {
  // canvas元素的引用
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isGameover, setIsGameover] = useState(false)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)

  // 绑定canvas元素的"ctx"到game
  useEffect(() => {
    game.ctx = canvasRef.current?.getContext('2d')
    game.onStart = () => {
      setRunning(true)
    }
    game.onGameover = () => {
      setRunning(false)
      setIsGameover(true)
    }
    game.onScoreChange = setScore

    // 绘制面板
    game.draw()
  }, [])

  // 监听键盘事件
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      e.preventDefault()
      
      switch(keycode(e)) {
        case 'left':
        case 'a':
          game.moveX('l')
          break
        case 'right':
        case 'd':
          game.moveX('r')
          break
        case 'down':
        case 's':
          game.moveDown()
          break
        case 'up':
        case 'w':
        case 'r':
          game.rotate()
          break
        case 'enter':
        case 'space':
          if (game.isPlaying) {
            game.fallDown()
          } else {
            game.start()
          }
      }
    }

    document.addEventListener('keydown', onKeydown)

    return () => document.removeEventListener('keydown', onKeydown)
  }, [])

  return (
    <div className="App">
      <header>
        <span className="score-label">SCORE: </span>
        <span className="score-value">{score}</span>
      </header>
      <section>
        <canvas
          id="game-renderer"
          width={201}
          height={401}
          ref={canvasRef}
        ></canvas>
        {running ? null : (
          <Popup game={game} isGameover={isGameover} />
        )}
      </section>
      <footer>
        <button className='iconfont icon-arrow-left' onClick={() => game.moveX('l')}></button>
        <button className='iconfont icon-arrow-down' onClick={() => game.moveDown()}></button>
        <button className='iconfont icon-arrow-right' onClick={() => game.moveX('r')}></button>
        <span>&nbsp;&nbsp;</span>
        <button className='iconfont icon-arrow-bottom' onClick={() => game.fallDown()}></button>
        <button className='iconfont icon-arrow-rotate' onClick={() => game.rotate()}></button>
      </footer>
    </div>
  );
}

export default App;
