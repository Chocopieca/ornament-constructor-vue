import { defineStore } from 'pinia'
import {
  PATTERN_SIZE,
  NUMBER_PATTERNS,
  LATIN_PATTERNS,
  UKRAINIAN_PATTERNS,
  type Pattern,
} from '@/constants/patterns/index'

export type ReflectionType = 'normal' | 'vertical' | 'horizontal' | 'both'

export interface Position {
  x: number
  y: number
  reflectionType: ReflectionType
}

export interface PlacedNumber {
  id: number
  value: number | string
  pattern: Pattern
  position: Position
  reflections: Position[]
  zIndex: number
  color: string
}

interface OrnamentState {
  placedNumbers: PlacedNumber[]
  selectedNumberId: number | null
  currentZIndex: number
  selectedColor: string
  gridDivision: number
  gridColor: string
  topText: string
  bottomText: string
}

interface ClickResult {
  number: PlacedNumber
  isReflection: boolean
  reflectionIndex?: number
}

export const useOrnamentStore = defineStore('ornament', {
  state: (): OrnamentState => ({
    placedNumbers: [],
    selectedNumberId: null,
    currentZIndex: 0,
    selectedColor: '#35495e',
    gridDivision: 2,
    gridColor: '#FFFFFF',
    topText: '',
    bottomText: '',
  }),

  actions: {
    calculateReflections(position: Position): Position[] {
      const centerX = 15 // Центр сетки по X
      const centerY = 15 // Центр сетки по Y

      return [
        // Отражение по вертикали (относительно вертикальной линии)
        {
          x: 2 * centerX - position.x - PATTERN_SIZE.width,
          y: position.y,
          reflectionType: 'vertical',
        },
        // Отражение по горизонтали (относительно горизонтальной линии)
        {
          x: position.x,
          y: 2 * centerY - position.y - PATTERN_SIZE.height,
          reflectionType: 'horizontal',
        },
        // Диагональное отражение (относительно обеих линий)
        {
          x: 2 * centerX - position.x - PATTERN_SIZE.width,
          y: 2 * centerY - position.y - PATTERN_SIZE.height,
          reflectionType: 'both',
        },
      ]
    },

    placeSymbol(value: number | string) {
      const pattern =
        typeof value === 'number'
          ? NUMBER_PATTERNS[value]
          : value.length === 1
            ? LATIN_PATTERNS[value] || UKRAINIAN_PATTERNS[value]
            : null

      if (!pattern) return

      const pos = this.findFreePosition()
      if (!pos) return

      const id = Date.now()
      const positionWithType: Position = { ...pos, reflectionType: 'normal' as const }
      const reflections = this.calculateReflections(positionWithType)

      this.placedNumbers.push({
        id,
        value,
        pattern,
        position: positionWithType,
        reflections,
        zIndex: this.currentZIndex++,
        color: this.selectedColor,
      })

      this.selectNumber(id)
    },

    findFreePosition(): Position | null {
      // Поиск свободной позиции для размещения
      for (let y = 0; y < 30; y++) {
        for (let x = 0; x < 30; x++) {
          if (this.isPositionFree({ x, y, reflectionType: 'normal' })) {
            return { x, y, reflectionType: 'normal' }
          }
        }
      }
      return null
    },

    selectNumber(id: number | null) {
      // Сначала обновляем zIndex если нужно
      if (id) {
        const number = this.placedNumbers.find((n) => n.id === id)
        if (number) {
          number.zIndex = this.currentZIndex++
        }
      }

      // Затем обновляем выделение
      this.selectedNumberId = id
    },

    deleteSelectedNumber() {
      if (this.selectedNumberId) {
        // Сначала снимаем выделение
        const idToDelete = this.selectedNumberId
        this.selectedNumberId = null

        // Затем удаляем число
        this.placedNumbers = this.placedNumbers.filter((num) => num.id !== idToDelete)
      }
    },

    isPositionFree(position: Position): boolean {
      return !this.placedNumbers.some((num) => {
        const numEndX = num.position.x + 3
        const numEndY = num.position.y + 5

        return !(
          position.x >= numEndX ||
          num.position.x >= position.x + 3 ||
          position.y >= numEndY ||
          num.position.y >= position.y + 5
        )
      })
    },

    moveSelectedNumber(dx: number, dy: number) {
      if (!this.selectedNumberId) return

      const number = this.placedNumbers.find((n) => n.id === this.selectedNumberId)
      if (!number) return

      const newPosition = {
        x: number.position.x + dx,
        y: number.position.y + dy,
        reflectionType: number.position.reflectionType, // Сохраняем тип отражения
      }

      // Обновляем позицию
      number.position = newPosition
      // Пересчитываем отражения с сохранением их типов
      number.reflections = this.calculateReflections(newPosition)
    },

    getNumberAtPosition(x: number, y: number): ClickResult | null {
      const result = this.placedNumbers
        .map((num) => {
          // Проверяем основную позицию
          if (
            x >= num.position.x &&
            x < num.position.x + PATTERN_SIZE.width &&
            y >= num.position.y &&
            y < num.position.y + PATTERN_SIZE.height
          ) {
            return { number: num, isReflection: false }
          }

          // Проверяем отражения
          const reflectionIndex = num.reflections.findIndex(
            (reflection) =>
              x >= reflection.x &&
              x < reflection.x + PATTERN_SIZE.width &&
              y >= reflection.y &&
              y < reflection.y + PATTERN_SIZE.height,
          )

          if (reflectionIndex !== -1) {
            return {
              number: num,
              isReflection: true,
              reflectionIndex,
            }
          }

          return null
        })
        .filter((item): item is ClickResult => item !== null) // Type guard
        .sort((a, b) => b.number.zIndex - a.number.zIndex)[0]

      return result || null
    },

    setColor(color: string) {
      this.selectedColor = color
      if (this.selectedNumberId) {
        const number = this.placedNumbers.find((n) => n.id === this.selectedNumberId)
        if (number) {
          number.color = color
        }
      }
    },

    setGridDivision(division: number) {
      this.gridDivision = division
    },

    setGridColor(color: string) {
      this.gridColor = color
    },
  },
})
