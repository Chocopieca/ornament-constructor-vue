import { useOrnamentStore } from '@/stores/ornament'
import type { PlacedNumber, Position } from '@/stores/ornament'
import { CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE } from '@/constants/grid'

export const useImageGenerator = () => {
  const store = useOrnamentStore()

  const drawNumber = (
    ctx: CanvasRenderingContext2D,
    number: PlacedNumber,
    position: Position,
    drawGrid = false,
  ) => {
    const pattern = number.pattern

    ctx.save()

    // Настраиваем трансформации для отражения
    const cellX = position.x * CELL_SIZE
    const cellY = position.y * CELL_SIZE

    // Применяем трансформации в зависимости от типа отражения
    if (position.reflectionType !== 'normal') {
      ctx.translate(
        cellX + (pattern[0].length * CELL_SIZE) / 2,
        cellY + (pattern.length * CELL_SIZE) / 2,
      )

      if (position.reflectionType === 'vertical' || position.reflectionType === 'both') {
        ctx.scale(-1, 1)
      }
      if (position.reflectionType === 'horizontal' || position.reflectionType === 'both') {
        ctx.scale(1, -1)
      }

      ctx.translate(
        -(cellX + (pattern[0].length * CELL_SIZE) / 2),
        -(cellY + (pattern.length * CELL_SIZE) / 2),
      )
    }

    // Рисуем символ
    for (let py = 0; py < pattern.length; py++) {
      for (let px = 0; px < pattern[0].length; px++) {
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

    ctx.restore()
  }

  const generateImage = () => {
    // Уменьшаем размер области для текста до 1/4.8 от высоты орнамента
    const textAreaHeight = CANVAS_HEIGHT / 4.8
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = CANVAS_WIDTH
    tempCanvas.height = CANVAS_HEIGHT + textAreaHeight * 2

    const ctx = tempCanvas.getContext('2d')
    if (!ctx) return null

    // Заполняем фон
    ctx.fillStyle = store.gridColor
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT + textAreaHeight * 2)

    // Рисуем темно-синие области для текста
    ctx.fillStyle = '#1E2761'
    ctx.fillRect(0, 0, CANVAS_WIDTH, textAreaHeight)
    ctx.fillRect(0, CANVAS_HEIGHT + textAreaHeight, CANVAS_WIDTH, textAreaHeight)

    // Настраиваем стиль текста
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 32px Arial' // Уменьшаем размер шрифта
    ctx.textAlign = 'center'

    // Рисуем верхний текст
    if (store.topText) {
      ctx.fillText(store.topText, CANVAS_WIDTH / 2, textAreaHeight / 2 + 10)
    }

    // Рисуем нижний текст
    if (store.bottomText) {
      ctx.fillText(store.bottomText, CANVAS_WIDTH / 2, CANVAS_HEIGHT + textAreaHeight * 1.5 + 10)
    }

    // Рисуем орнамент
    ctx.translate(0, textAreaHeight)

    const sortedNumbers = [...store.placedNumbers].sort((a, b) => a.zIndex - b.zIndex)

    sortedNumbers.forEach((number) => {
      drawNumber(ctx, number, number.position)
      number.reflections.forEach((reflection) => {
        drawNumber(ctx, number, reflection)
      })
    })

    return tempCanvas.toDataURL('image/png')
  }

  const saveImage = () => {
    const imageUrl = generateImage()
    if (!imageUrl) return

    const link = document.createElement('a')
    link.download = 'ornament.png'
    link.href = imageUrl

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printImage = () => {
    const imageUrl = generateImage()
    if (!imageUrl) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Орнамент</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            @media print {
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              img {
                max-width: 210mm; /* Ширина A4 */
                max-height: 297mm; /* Высота A4 */
                width: auto;
                height: auto;
                object-fit: contain;
              }
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" />
        </body>
      </html>
    `)

    printWindow.document.close()

    const img = printWindow.document.querySelector('img')
    if (img) {
      img.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    }
  }

  return {
    generateImage,
    saveImage,
    printImage,
  }
}
