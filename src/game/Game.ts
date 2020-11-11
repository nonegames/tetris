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
  shapeN: ShapeName = 'L'
  /**
   * 当前形状方向
   */
  shapeD: number = 1
  /**
   * 形状当前位置 [x, y]
   */
  shapePos: [x: number, y: number] = [3, 6]
  /**
   * 游戏板面
   */
  board: number[] = Array(BOARD_W * BOARD_H).fill(0)

  /**
   * requestAnimationFrame的id
   */
  rafId = 0

  /**
   * 上一次执行流程的时间
   */
  processTime: number | null = null

  /**
   * 执行流程需要等待的毫秒数
   */
  processWait: number = 1000

  /**
   * 正在
   */
  isFallingDown: boolean = false

  // 开始游戏时的回调函数
  onStart?: () => void = undefined
  // 游戏结束时的回调函数
  onGameover?: () => void = undefined
  // 分数改变时的回调
  onScoreChange?: (score: number) => void = undefined

  /**
   * 随机选择一个形状
   */
  pickShape() {
    const shapeNames = Object.keys(shapes) as Array<keyof typeof shapes>
    // 随机挑选一个
    const name = randomItem<keyof typeof shapes>(shapeNames)
    this.shapeN = name
    this.shapeD = randomIndex(shapes[name].length)

    this.processTime = null
    this.shapePos = [randomIndex(BOARD_W - shapes[name][this.shapeD][0]), 0]
  }

  /**
   * 合并形状至画板
   */
  combine() {
    // 当前形状坐标
    const [x, y] = this.shapePos
    // 当前形状名称与方向
    const { shapeN: name, shapeD: direction } = this
    // 当前形状的宽高与数据
    const [w, h, ...shape] = shapes[name][direction]
    // 当前画板数据
    const board = this.board.slice()

    // 遍历画板中与形状重合的坐标数据
    for(let row = y; row < y + h; row += 1) {
      for(let col = x; col < x + w; col += 1) {
        // 形状格子坐标
        const sx = col - x
        const sy = row - y
        // 计算该坐标下画板的值
        board[row * BOARD_W + col] = board[row * BOARD_W + col] + shape[sy * w + sx] > 0 ? 1 : 0
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
    const cw = CEIL_SIZE - 1
    const ch = CEIL_SIZE - 1

    const borderSize = 2

    ctx.save()
    if (solid) {
      ctx.fillStyle = '#444'
      ctx.fillRect(cx, cy, cw, ch)

      ctx.fillStyle = '#666'
      ctx.fillRect(cx + borderSize, cy + borderSize, cw - 2 * borderSize, ch - 2 * borderSize)

      ctx.fillStyle = '#444'
      ctx.fillRect(cx + 2 * borderSize, cy +  2 * borderSize, cw - 4 * borderSize, ch - 4 * borderSize)

    } else {
      ctx.fillStyle = '#bbb'
      ctx.fillRect(cx, cy, cw, ch)
    }
    ctx.restore()
  }

  /**
   * 绘制画板
   */
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
   * 判断是否能向某个方向移动
   * @param d 移动方向
   */
  canMove(d: 'l' | 'r' | 'd') {
    // 当前形状的坐标
    const [shapeX, shapeY] = this.shapePos
    // 当前形状数据
    const [w, h, ...shape] = shapes[this.shapeN][this.shapeD]
    const { board } = this
    // 目标坐标
    let x, y

    // 水平方向的移动
    if (d === 'l') {
      // 向左移动
      x = shapeX - 1
    } else if (d === 'r') {
      // 向右移动
      x = shapeX + 1
    } else {
      x = shapeX
    }

    // 向下移动
    if (d === 'd') {
      y = shapeY + 1
    } else {
      y = shapeY
    }

    // 超出边界
    if (x < 0 || x > BOARD_W - w || y > BOARD_H - h) {
      return false
    }

    // 检测是否有碰撞
    for(let row = y; row < y + h; row += 1) {
      for(let col = x; col < x + w; col += 1) {
        // 形状格子坐标
        const sx = col - x
        const sy = row - y
        if (board[row * BOARD_W + col] * shape[sy * w + sx] !== 0) {
          // 存在碰撞，返回false
          return false
        }
      }
    }

    return true
  }

  /**
   * 水平移到
   * @param d 移动方向
   */
  moveX(d: 'l' | 'r') {
    if (this.canMove(d)) {
      if (d === 'l') {
        this.shapePos[0] -= 1
      } else if (d === 'r') {
        this.shapePos[0] += 1
      }
    }
  }
  /**
   * 向下移动
   */
  moveDown() {
    if (this.canMove('d')) {
      this.shapePos[1] += 1
    }
  }

  /**
   * 开始直接到底，即快速下落
   */
  fallDown() {
    this.isFallingDown = true
  }

  /**
   * 检测游戏是否结束
   * 当形状刚生成还未下落，且与当前面板中的方格发生碰撞，则表示游戏结束
   */
  testGameover() {
    const [x, y] = this.shapePos
    if (y > 0) return false

    const [w, h, ...shape] = shapes[this.shapeN][this.shapeD]
    
    // 检测是否有碰撞
    for(let row = y; row < y + h; row += 1) {
      for(let col = x; col < x + w; col += 1) {
        // 形状格子坐标
        const sx = col - x
        const sy = row - y
        if (this.board[row * BOARD_W + col] * shape[sy * w + sx] !== 0) {
          // 存在碰撞，游戏结束
          return true
        }
      }
    }

    return false
  }

  /**
   * 处理计分与整理面板
   */
  dealScore() {
    const scoreRows: number[] = []
    for(let row = 0; row < BOARD_H; row += 1) {
      let rowResult = 1
      for(let col = 0; col < BOARD_W; col += 1) {
        rowResult *= this.board[row * BOARD_W + col]
      }
      if (rowResult > 0) {
        scoreRows.push(row)
      }
    }

    if (scoreRows.length > 0) {
      // 每行10分
      this.score += scoreRows.length * 10
      // 通知UI更新得分
      if (this.onScoreChange) {
        this.onScoreChange.call(undefined, this.score)
      }
      // 消除满行
      scoreRows.reverse().forEach((scoreRowIndex) => {
        this.board.splice(scoreRowIndex * BOARD_W, BOARD_W)
      })
      // 补充新行
      this.board = Array<number>(scoreRows.length * BOARD_W).fill(0).concat(this.board)
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
    // 若游戏已经结束则直接退出
    if (this.testGameover()) {
      this.gameover()
      return
    }

    if (this.processTime === null) {
      this.processTime = time
    } else if (this.isFallingDown || time - this.processTime >= this.processWait) {
      this.processTime = time

      if (this.canMove('d')) {
        // 能够下落一格
        this.shapePos[1] += 1
      } else {
        // 已经无法下降，处理相关逻辑
        this.board = this.combine()
        this.dealScore()
        this.pickShape()
        
        // 解除快速下落模式
        if (this.isFallingDown) {
          this.isFallingDown = false
        }
      }
    }

    // 重新绘制
    this.draw()
  }
  /**
   * 开始游戏
   */
  start() {
    this.board.fill(0)
    this.score = 0
    this.isFallingDown = false
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