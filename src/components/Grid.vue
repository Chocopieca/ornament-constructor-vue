<template>
  <div class="grid-wrapper">
    <div 
      class="grid-container" 
      tabindex="0" 
      @keydown.delete="handleDelete"
      @keydown.left.prevent="moveSelected(-1, 0)"
      @keydown.right.prevent="moveSelected(1, 0)"
      @keydown.up.prevent="moveSelected(0, -1)"
      @keydown.down.prevent="moveSelected(0, 1)"
    >
      <canvas 
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        @click="handleClick"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      ></canvas>
    </div>
    <button class="save-button" @click="saveOrnament">
      Сохранить орнамент
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useOrnamentStore } from '@/stores/ornament'
import { NUMBER_PATTERNS, PATTERN_SIZE } from '@/constants/numberPatterns'

const store = useOrnamentStore()

const CELL_SIZE = 30
const GRID_COLS = 30
const GRID_ROWS = 30

const canvasWidth = CELL_SIZE * GRID_COLS
const canvasHeight = CELL_SIZE * GRID_ROWS

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const dragStartCell = ref({ x: 0, y: 0 })

// Выносим функцию drawNumber на уровень компонента
const drawNumber = (
  ctx: CanvasRenderingContext2D,
  number: PlacedNumber,
  offsetX: number,
  offsetY: number,
  flipX = false,
  flipY = false,
  drawGrid = true
) => {
  const pattern = NUMBER_PATTERNS[number.value as keyof typeof NUMBER_PATTERNS]
  
  ctx.save()

  if (flipX || flipY) {
    ctx.translate(
      flipX ? canvasWidth : 0,
      flipY ? canvasHeight : 0
    )
    ctx.scale(
      flipX ? -1 : 1,
      flipY ? -1 : 1
    )
  }

  for (let py = 0; py < PATTERN_SIZE.height; py++) {
    for (let px = 0; px < PATTERN_SIZE.width; px++) {
      if (pattern[py][px] === 1) {
        const x = (number.x + px + offsetX) * CELL_SIZE
        const y = (number.y + py + offsetY) * CELL_SIZE
        
        ctx.fillStyle = number.color
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
        
        if (drawGrid) {
          ctx.strokeStyle = 'white'
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)
        }
      }
    }
  }

  if (number.id === store.selectedNumberId && drawGrid) {
    ctx.strokeStyle = '#ee6b00'
    ctx.lineWidth = 2
    ctx.strokeRect(
      (number.x + offsetX) * CELL_SIZE - 1,
      (number.y + offsetY) * CELL_SIZE - 1,
      PATTERN_SIZE.width * CELL_SIZE + 2,
      PATTERN_SIZE.height * CELL_SIZE + 2
    )
  }

  ctx.restore()
}

const drawGrid = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Рисуем сетку
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1

  // Рисуем вертикальную центральную линию
  ctx.strokeStyle = '#999'
  ctx.beginPath()
  ctx.moveTo(canvasWidth / 2, 0)
  ctx.lineTo(canvasWidth / 2, canvasHeight)
  ctx.stroke()

  // Рисуем горизонтальную центральную линию
  ctx.beginPath()
  ctx.moveTo(0, canvasHeight / 2)
  ctx.lineTo(canvasWidth, canvasHeight / 2)
  ctx.stroke()

  // Возвращаем цвет для остальных линий сетки
  ctx.strokeStyle = '#ddd'

  for (let x = 0; x <= canvasWidth; x += CELL_SIZE) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasHeight)
    ctx.stroke()
  }

  for (let y = 0; y <= canvasHeight; y += CELL_SIZE) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvasWidth, y)
    ctx.stroke()
  }

  const sortedNumbers = [...store.placedNumbers].sort((a, b) => a.zIndex - b.zIndex)

  // Отрисовываем числа во всех четвертях
  sortedNumbers.forEach(number => {
    if (number.x < GRID_COLS / 2 && number.y < GRID_ROWS / 2) {
      drawNumber(ctx, number, 0, 0)
      
      const mirrorX = GRID_COLS - number.x - PATTERN_SIZE.width
      drawNumber(ctx, { ...number, x: mirrorX }, 0, 0)
      
      const mirrorY = GRID_ROWS - number.y - PATTERN_SIZE.height
      drawNumber(ctx, { ...number, y: mirrorY }, 0, 0)
      
      drawNumber(ctx, { ...number, x: mirrorX, y: mirrorY }, 0, 0)
    }
  })
}

const handleMouseDown = (event: MouseEvent) => {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = Math.floor((event.clientX - rect.left) / CELL_SIZE)
  const y = Math.floor((event.clientY - rect.top) / CELL_SIZE)

  const clickedNumber = store.getNumberAtPosition(x, y)
  
  if (clickedNumber) {
    isDragging.value = true
    store.selectNumber(clickedNumber.id)
    dragStartPos.value = { x: event.clientX, y: event.clientY }
    dragStartCell.value = { x: clickedNumber.x, y: clickedNumber.y }
    event.preventDefault() // Предотвращаем выделение текста при перетаскивании
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || !store.selectedNumberId) return

  const deltaX = Math.floor((event.clientX - dragStartPos.value.x) / CELL_SIZE)
  const deltaY = Math.floor((event.clientY - dragStartPos.value.y) / CELL_SIZE)

  if (deltaX !== 0 || deltaY !== 0) {
    const newX = dragStartCell.value.x + deltaX
    const newY = dragStartCell.value.y + deltaY
    
    // Ограничиваем движение первой четвертью
    if (newX >= 0 && 
        newX + PATTERN_SIZE.width <= GRID_COLS / 2 && 
        newY >= 0 && 
        newY + PATTERN_SIZE.height <= GRID_ROWS / 2) {
      store.moveSelectedNumber(
        newX - dragStartCell.value.x,
        newY - dragStartCell.value.y
      )
      dragStartPos.value = { 
        x: dragStartPos.value.x + deltaX * CELL_SIZE,
        y: dragStartPos.value.y + deltaY * CELL_SIZE
      }
      dragStartCell.value = { x: newX, y: newY }
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

  const clickedNumber = store.getNumberAtPosition(x, y)
  store.selectNumber(clickedNumber?.id || null)
}

const handleDelete = () => {
  store.deleteSelectedNumber()
}

const moveSelected = (dx: number, dy: number) => {
  store.moveSelectedNumber(dx, dy)
}

const drawOrnamentWithoutGrid = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  const sortedNumbers = [...store.placedNumbers].sort((a, b) => a.zIndex - b.zIndex)

  sortedNumbers.forEach(number => {
    if (number.x < GRID_COLS / 2 && number.y < GRID_ROWS / 2) {
      drawNumber(ctx, number, 0, 0, false, false, false)
      
      const mirrorX = GRID_COLS - number.x - PATTERN_SIZE.width
      drawNumber(ctx, { ...number, x: mirrorX }, 0, 0, false, false, false)
      
      const mirrorY = GRID_ROWS - number.y - PATTERN_SIZE.height
      drawNumber(ctx, { ...number, y: mirrorY }, 0, 0, false, false, false)
      
      drawNumber(ctx, { ...number, x: mirrorX, y: mirrorY }, 0, 0, false, false, false)
    }
  })
}

const saveOrnament = () => {
  // Создаем временный canvas для рендеринга без сетки
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvasWidth
  tempCanvas.height = canvasHeight
  
  drawOrnamentWithoutGrid(tempCanvas)
  
  // Создаем ссылку для скачивания
  const link = document.createElement('a')
  link.download = 'ornament.png'
  link.href = tempCanvas.toDataURL('image/png')
  
  // Симулируем клик для скачивания
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

watch(() => store.placedNumbers, drawGrid, { deep: true })
watch(() => store.selectedNumberId, drawGrid)

onMounted(() => {
  drawGrid()
})
</script>

<style scoped>
.grid-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.grid-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  overflow: auto;
  max-width: 100%;
  outline: none;
  user-select: none;
}

canvas {
  border: 1px solid #ccc;
  background-color: white;
  cursor: default;
}

canvas:active {
  cursor: grabbing;
}

.save-button {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.save-button:hover {
  background-color: var(--secondary-color);
  transform: translateY(-1px);
}

.save-button:active {
  transform: translateY(0);
}
</style> 