import shapes from './shapes'
import { randomIndex, randomItem } from './utils'

/**
 * 游戏面板宽度，即水平方向方格数量
 */
export const BOARD_W = 10
/**
 * 游戏面板高度，即垂直方向方格数量
 */
export const BOARD_H = 20
/**
 * 一个小格子的尺寸
 */
export const CEIL_SIZE = 20

/**
 * 形状名称
 */
type ShapeName = keyof typeof shapes

/**
 * 游戏类
 */
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
   * 当前形状名称
   */
  shapeN: ShapeName = 'T'
  /**
   * 当前形状方向
   */
  shapeD: number = 0
  /**
   * 形状当前位置 [x, y]
   */
  shapePos: [x: number, y: number] = [0, 0]
  /**
   * 游戏板面
   */
  board: number[] = Array(BOARD_W * BOARD_H).fill(0)

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
    this.shapeN = name
    this.shapeD = randomIndex(shapes[name].length)
  }

  /**
   * 合并形状至画板
   */
  combine() {
    const [x, y] = this.shapePos
    const { shapeN: name, shapeD: direction } = this
    const [w, h, ...shape] = shapes[name][direction]
    const board = this.board.slice()

    for(let row = y; row < y + h; row += 1) {
      for(let col = x; col < x + w; col += 1) {
        // 形状格子坐标
        const sx = col - x
        const sy = row - y
        board[row * BOARD_W + col] = shape[sy * w + sx]
      }
    }

    return board
  }

  /**
   * 绘制一个小格子
   */
  drawCeil(x: number, y: number, solid: boolean = false) {
    const { ctx } = this
    if (!ctx) return

    /**
     * 绘制目标的坐标与宽高，留出1像素的缝隙
     */
    const cx = x * CEIL_SIZE + 1
    const cy = y * CEIL_SIZE + 1
    const cw = CEIL_SIZE - 2
    const ch = CEIL_SIZE - 2

    ctx.save()
    ctx.fillStyle = solid ? '#000' : '#888'
    ctx.fillRect(cx, cy, cw, ch)
    ctx.restore()
  }

  draw() {
    const { ctx } = this
    if (!ctx) return
    // 先清空canvas
    ctx.clearRect(0, 0, BOARD_W * CEIL_SIZE, BOARD_H * CEIL_SIZE)
    // 计算需要绘制的面板数据
    const board = this.combine()
    // 逐格绘制
    for(let y = 0; y < BOARD_H; y += 1) {
      for(let x = 0; x < BOARD_W; x += 1) {
        const solid = board[y * BOARD_W + x] === 1
        this.drawCeil(x, y, solid)
      }
    }
  }

  /**
   * 旋转形状，即使用该形状的下一个方向数据
   */
  rotate() {
    const shape = shapes[this.shapeN]
    this.shapeD = (this.shapeD + 1) % shape.length
    const [w, h] = shapes[this.shapeN][this.shapeD]
    const [x, y] = this.shapePos
    // 避免右侧超出
    if (x > BOARD_W - w) {
      this.shapePos[0] = BOARD_W - w
    }
    // 避免底部超出
    if (y > BOARD_H - h) {
      this.shapePos[1] = BOARD_H - h
    }
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

    // 需要重新绘制时
    this.draw()
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