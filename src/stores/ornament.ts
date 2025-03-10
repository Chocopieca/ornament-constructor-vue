import { defineStore } from 'pinia'

interface PlacedNumber {
  id: number
  value: number
  x: number
  y: number
  zIndex: number
  color: string
}

interface OrnamentState {
  placedNumbers: PlacedNumber[]
  selectedNumberId: number | null
  currentZIndex: number
  selectedColor: string
}

export const useOrnamentStore = defineStore('ornament', {
  state: (): OrnamentState => ({
    placedNumbers: [],
    selectedNumberId: null,
    currentZIndex: 0,
    selectedColor: '#35495e'
  }),
  
  actions: {
    placeNumber(value: number) {
      let x = 0
      let y = 0
      let found = false

      while (!found && y < 25) {
        if (this.isPositionFree(x, y)) {
          found = true
        } else {
          x += 3
          if (x > 27) {
            x = 0
            y += 5
          }
        }
      }

      if (found) {
        const id = Date.now()
        this.placedNumbers.push({
          id,
          value,
          x,
          y,
          zIndex: this.currentZIndex++,
          color: this.selectedColor
        })
        this.selectedNumberId = id
      }
    },

    selectNumber(id: number | null) {
      if (id) {
        const number = this.placedNumbers.find(n => n.id === id)
        if (number) {
          number.zIndex = this.currentZIndex++
        }
      }
      this.selectedNumberId = id
    },

    deleteSelectedNumber() {
      if (this.selectedNumberId) {
        this.placedNumbers = this.placedNumbers.filter(
          num => num.id !== this.selectedNumberId
        )
        this.selectedNumberId = null
      }
    },

    isPositionFree(x: number, y: number): boolean {
      return !this.placedNumbers.some(num => {
        const numEndX = num.x + 3
        const numEndY = num.y + 5
        
        return !(x >= numEndX ||
                num.x >= x + 3 ||
                y >= numEndY ||
                num.y >= y + 5)
      })
    },

    moveSelectedNumber(dx: number, dy: number) {
      if (!this.selectedNumberId) return

      const number = this.placedNumbers.find(n => n.id === this.selectedNumberId)
      if (!number) return

      const newX = number.x + dx
      const newY = number.y + dy

      if (newX >= 0 && 
          newX + 3 <= 30 && 
          newY >= 0 && 
          newY + 5 <= 30) {
        number.x = newX
        number.y = newY
      }
    },

    getNumberAtPosition(x: number, y: number): PlacedNumber | null {
      return this.placedNumbers
        .filter(num => {
          const inX = x >= num.x && x < num.x + 3
          const inY = y >= num.y && y < num.y + 5
          return inX && inY
        })
        .sort((a, b) => b.zIndex - a.zIndex)[0] || null
    },

    setColor(color: string) {
      this.selectedColor = color
      if (this.selectedNumberId) {
        const number = this.placedNumbers.find(n => n.id === this.selectedNumberId)
        if (number) {
          number.color = color
        }
      }
    }
  }
})