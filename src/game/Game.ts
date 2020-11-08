import shapes from './shapes'
import { randomIndex, randomItem } from './utils'

export class Game {
  /**
   * canvas 的context对象
   */
  ctx?: CanvasRenderingContext2D | null = null
  /**
   * 得分
   */
  score = 0
  /**
   * 当前形状
   */
  theShape = {
    // 形状名称
    name: '',
    // 形状方向，索引值
    direction: 0,
  }
  /**
   * 形状当前位置 [x, y]
   */
  shapePos = [0, 0]
  /**
   * 游戏板面
   */
  board = Array(200).fill(0)

  /**
   * requestAnimationFrame的id
   */
  rafId = 0

  // 开始游戏时的回调函数
  onStart?: () => void = undefined
  // 游戏结束时的回调函数
  onGameover?: () => void = undefined

  /**
   * 随机选择一个形状
   */
  pickShape() {
    const shapeNames = Object.keys(shapes) as Array<keyof typeof shapes>
    // 随机挑选一个
    const name = randomItem<keyof typeof shapes>(shapeNames)
    this.theShape.name = name
    this.theShape.direction = randomIndex(shapes[name].length)
  }

  /**
   * 游戏循环
   * @param time 当前帧时间
   */
  loop(time: number) {
    this.rafId = requestAnimationFrame((time) => this.loop(time))
    this.process(time)
  }

  /**
   * 每一帧的处理流程
   * @param time 当前帧时间
   */
  process(time: number) {

  }
  /**
   * 开始游戏
   */
  start() {
    this.score = 0
    this.pickShape()
    this.rafId = requestAnimationFrame((time) => this.loop(time))

    if (this.onStart) {
      this.onStart.call(undefined)
    }
  }
  /**
   * 游戏结束
   */
  gameover() {
    cancelAnimationFrame(this.rafId)

    if (this.onGameover) {
      this.onGameover.call(undefined)
    }
  }
}