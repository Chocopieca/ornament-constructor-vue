<template>
  <div>
    <div class="controls">
      <GridControls />
      <GridColorPanel />
    </div>
    <div class="grid-wrapper" @keydown.delete="handleDelete" tabindex="0" ref="gridWrapper">
      <div
        class="grid-container"
        @keydown.left.prevent="moveSelected(-1, 0)"
        @keydown.right.prevent="moveSelected(1, 0)"
        @keydown.up.prevent="moveSelected(0, -1)"
        @keydown.down.prevent="moveSelected(0, 1)"
      >
        <canvas
          ref="canvasRef"
          :width="CANVAS_WIDTH"
          :height="CANVAS_HEIGHT"
          @click="handleClick"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useOrnamentStore } from '@/stores/ornament'
import { useGrid } from '@/composables/useGrid'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/constants/grid'
import GridControls from './GridControls.vue'
import GridColorPanel from './GridColorPanel.vue'

const store = useOrnamentStore()

const { canvasRef, drawGrid, handleMouseDown, handleMouseMove, handleMouseUp, handleClick } =
  useGrid()

const gridWrapper = ref<HTMLDivElement | null>(null)

const handleDelete = () => {
  store.deleteSelectedNumber()
}

const moveSelected = (dx: number, dy: number) => {
  store.moveSelectedNumber(dx, dy)
}

watch(
  () => store.selectedNumberId,
  (newId) => {
    if (newId && gridWrapper.value) {
      gridWrapper.value.focus({ preventScroll: true })
    }
  },
)

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
  outline: none;
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

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
</style>
