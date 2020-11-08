import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import { Game } from './game'

// Game实例
const game = new Game()

function App() {
  // canvas元素的引用
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [running, setRunning] = useState(false)

  // 绑定canvas元素的"ctx"到game
  useEffect(() => {
    game.ctx = canvasRef.current?.getContext('2d')
    game.onStart = () => {
      setRunning(true)
    }
    game.onGameover = () => {
      setRunning(false)
    }
  }, [])

  return (
    <div className="App">
      <header>
        Score: 100
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
        <button>left</button>
        <button>right</button>
        <button>bottom</button>
        <button>rotate</button>
      </footer>
    </div>
  );
}

export default App;
