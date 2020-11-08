export function randomIndex(arrayLength: number): number {
  return Math.floor(Math.random() * arrayLength)
}

/**
 * 数组中随机选择一个元素
 * @param array 
 */
export function randomItem<T=number>(array: Array<T>): T {
  return array[randomIndex(array.length)]
}