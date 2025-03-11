import { ref, watch } from 'vue'
import { useOrnamentStore } from '@/stores/ornament'
import type { PlacedNumber, Position } from '@/stores/ornament'
import { PATTERN_SIZE } from '@/constants/patterns/index'
import { CELL_SIZE, GRID_COLS, GRID_ROWS, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/constants/grid'
import { useImageGenerator } from '@/composables/useImageGenerator'

export const useGrid = () => {
  const store = useOrnamentStore()
  const { saveImage } = useImageGenerator()
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const isDragging = ref(false)
  const dragStartPos = ref({ x: 0, y: 0 })
  const dragStartCell = ref<Position>({ x: 0, y: 0, reflectionType: 'normal' })

  const drawNumber = (
    ctx: CanvasRenderingContext2D,
    number: PlacedNumber,
    position: Position,
    drawGrid = true,
  ) => {
    const pattern = number.pattern

    ctx.save()

    // Настраиваем трансформации для отражения
    const cellX = position.x * CELL_SIZE
    const cellY = position.y * CELL_SIZE

    // Применяем трансформации в зависимости от типа отражения
    if (position.reflectionType !== 'normal') {
      ctx.translate(
        cellX + (PATTERN_SIZE.width * CELL_SIZE) / 2,
        cellY + (PATTERN_SIZE.height * CELL_SIZE) / 2,
      )

      // Применяем отражения в зависимости от типа
      if (position.reflectionType === 'vertical' || position.reflectionType === 'both') {
        ctx.scale(-1, 1) // отражение по вертикали
      }
      if (position.reflectionType === 'horizontal' || position.reflectionType === 'both') {
        ctx.scale(1, -1) // отражение по горизонтали
      }

      ctx.translate(
        -(cellX + (PATTERN_SIZE.width * CELL_SIZE) / 2),
        -(cellY + (PATTERN_SIZE.height * CELL_SIZE) / 2),
      )
    }

    // Рисуем символ
    for (let py = 0; py < PATTERN_SIZE.height; py++) {
      for (let px = 0; px < PATTERN_SIZE.width; px++) {
        if (pattern[py][px] === 1) {
          const x = cellX + px * CELL_SIZE
          const y = cellY + py * CELL_SIZE

          ctx.fillStyle = number.color
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)

          if (drawGrid) {
            ctx.strokeStyle = number.color
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)
          }
        }
      }
    }

    // Рисуем рамку выделения
    if (number.id === store.selectedNumberId && drawGrid) {
      ctx.strokeStyle = '#ee6b00'
      ctx.lineWidth = 2
      ctx.strokeRect(
        cellX - 1,
        cellY - 1,
        PATTERN_SIZE.width * CELL_SIZE + 2,
        PATTERN_SIZE.height * CELL_SIZE + 2,
      )
    }

    ctx.restore()
  }

  const drawGrid = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Заполняем фон выбранным цветом
    ctx.fillStyle = store.gridColor
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Рисуем сетку противоположным цветом с прозрачностью
    const baseColor = store.gridColor === '#FFFFFF' ? '0, 0, 0' : '255, 255, 255'

    // Обычная сетка (полупрозрачная)
    ctx.strokeStyle = `rgba(${baseColor}, 0.2)`
    ctx.lineWidth = 1

    // Рисуем вертикальные линии
    for (let x = 0; x <= CANVAS_WIDTH; x += CELL_SIZE) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, CANVAS_HEIGHT)
      ctx.stroke()
    }

    // Рисуем горизонтальные линии
    for (let y = 0; y <= CANVAS_HEIGHT; y += CELL_SIZE) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(CANVAS_WIDTH, y)
      ctx.stroke()
    }

    // Рисуем центральные линии более толстыми и непрозрачными
    ctx.strokeStyle = `rgb(${baseColor})`
    ctx.lineWidth = 2

    // Вертикальная центральная линия
    ctx.beginPath()
    ctx.moveTo(CANVAS_WIDTH / 2, 0)
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
    ctx.stroke()

    // Горизонтальная центральная линия
    ctx.beginPath()
    ctx.moveTo(0, CANVAS_HEIGHT / 2)
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2)
    ctx.stroke()

    // Отрисовываем числа
    const sortedNumbers = [...store.placedNumbers].sort((a, b) => a.zIndex - b.zIndex)

    sortedNumbers.forEach((number) => {
      // Рисуем основное число
      drawNumber(ctx, number, number.position)

      // Рисуем отражения
      number.reflections.forEach((reflection) => {
        drawNumber(ctx, number, reflection)
      })
    })
  }

  const handleMouseDown = (event: MouseEvent) => {
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / CELL_SIZE)
    const y = Math.floor((event.clientY - rect.top) / CELL_SIZE)

    const clickResult = store.getNumberAtPosition(x, y)

    if (clickResult) {
      isDragging.value = true
      store.selectNumber(clickResult.number.id)
      dragStartPos.value = { x: event.clientX, y: event.clientY }

      // Если кликнули на отражение, используем его позицию и тип отражения
      if (clickResult.isReflection && clickResult.reflectionIndex !== undefined) {
        dragStartCell.value = clickResult.number.reflections[clickResult.reflectionIndex]
      } else {
        dragStartCell.value = clickResult.number.position
      }

      event.preventDefault()
    }
  }

  const getCellStep = () => CELL_SIZE / (store.gridDivision === 1 ? 1 : 2)

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value || !store.selectedNumberId) return

    const cellStep = getCellStep()

    // Используем значение из store и актуальный размер шага
    const deltaX =
      Math.floor((event.clientX - dragStartPos.value.x) / cellStep) / store.gridDivision
    const deltaY =
      Math.floor((event.clientY - dragStartPos.value.y) / cellStep) / store.gridDivision

    if (deltaX !== 0 || deltaY !== 0) {
      const newX = dragStartCell.value.x + deltaX
      const newY = dragStartCell.value.y + deltaY

      // Проверяем границы с учетом дробных значений
      if (
        newX >= 0 &&
        newX + PATTERN_SIZE.width <= GRID_COLS &&
        newY >= 0 &&
        newY + PATTERN_SIZE.height <= GRID_ROWS
      ) {
        const number = store.placedNumbers.find((n) => n.id === store.selectedNumberId)
        if (number) {
          let dx, dy

          // Вычисляем смещение в зависимости от типа отражения
          if (dragStartCell.value.reflectionType === 'normal') {
            dx = newX - number.position.x
            dy = newY - number.position.y
          } else {
            const centerX = GRID_COLS / 2
            const centerY = GRID_ROWS / 2
            let originalX = newX
            let originalY = newY

            // Пересчитываем координаты оригинала в зависимости от типа отражения
            if (
              dragStartCell.value.reflectionType === 'vertical' ||
              dragStartCell.value.reflectionType === 'both'
            ) {
              originalX = 2 * centerX - newX - PATTERN_SIZE.width
            }
            if (
              dragStartCell.value.reflectionType === 'horizontal' ||
              dragStartCell.value.reflectionType === 'both'
            ) {
              originalY = 2 * centerY - newY - PATTERN_SIZE.height
            }

            dx = originalX - number.position.x
            dy = originalY - number.position.y
          }

          store.moveSelectedNumber(dx, dy)
        }

        dragStartPos.value = {
          x: dragStartPos.value.x + deltaX * CELL_SIZE,
          y: dragStartPos.value.y + deltaY * CELL_SIZE,
        }

        // Сохраняем тип отражения при обновлении позиции
        dragStartCell.value = {
          x: newX,
          y: newY,
          reflectionType: dragStartCell.value.reflectionType,
        }
      }
    }
  }

  const handleMouseUp = () => {
    isDragging.value = false
  }

  const handleClick = (event: MouseEvent) => {
    if (isDragging.value) {
      isDragging.value = false
      return
    }

    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / CELL_SIZE)
    const y = Math.floor((event.clientY - rect.top) / CELL_SIZE)

    const clickResult = store.getNumberAtPosition(x, y)
    store.selectNumber(clickResult?.number.id || null)
  }

  watch(() => store.placedNumbers, drawGrid, { deep: true })
  watch(() => store.selectedNumberId, drawGrid)
  watch(() => store.gridColor, drawGrid)

  return {
    canvasRef,
    drawGrid,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleClick,
  }
}
