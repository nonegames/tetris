import React from 'react'
import { Game } from './game'

interface PopupProps {
  /**
   * 游戏类实例
   */
  game: Game
  /**
   * 是否是游戏结束
   */
  isGameover: boolean
}

const Popup: React.FC<PopupProps> = ({ game, isGameover }) => {
  return (
    <div className='popup-box'>
      {!isGameover ? null : (
        <div className='gameover-msg'>GAME OVER</div>
      )}
      <button
        id='btnStart'
        onClick={() => {
          game.start()
        }}
      >
        {isGameover ? 'TRY AGAIN' : 'START GAME'}
      </button>
    </div>
  )
}

export default Popup
