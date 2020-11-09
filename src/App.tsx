import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import { Game } from './game'

// Game实例
const game = new Game()

function App() {
  // canvas元素的引用
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
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
    }
    game.onScoreChange = setScore
  }, [])

  return (
    <div className="App">
      <header>
        Score: {score}
      </header>
      <section>
        <canvas
          id="game-renderer"
          width={200}
          height={400}
          ref={canvasRef}
        ></canvas>
        {running ? null : (
          <button
            id='btnStart'
            onClick={() => {
              game.start()
            }}
          >开始游戏</button>
        )}
      </section>
      <footer>
        <button onClick={() => game.moveX('l')}>left</button>
        <button onClick={() => game.moveDown()}>down</button>
        <button onClick={() => game.moveX('r')}>right</button>
        <button onClick={() => game.fallDown()}>bottom</button>
        <button onClick={() => game.rotate()}>rotate</button>
      </footer>
    </div>
  );
}

export default App;
