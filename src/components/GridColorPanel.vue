<template>
  <div class="grid-color-panel">
    <label>Цвет фона:</label>
    <div class="colors">
      <button
        v-for="color in colors"
        :key="color"
        :style="{ backgroundColor: color }"
        class="color-button"
        :class="{ active: selectedColor === color }"
        @click="selectColor(color)"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useOrnamentStore } from '@/stores/ornament'

const store = useOrnamentStore()

const colors = [
  '#FFFFFF', // Белый
  '#000000', // Черный
]

const selectedColor = computed(() => store.gridColor)

const selectColor = (color: string) => {
  store.setGridColor(color)
}
</script>

<style scoped>
.grid-color-panel {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
}

.colors {
  display: flex;
  gap: 10px;
}

.color-button {
  width: 30px;
  height: 30px;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.color-button:hover {
  transform: scale(1.1);
}

.color-button.active {
  border-color: var(--orange-color);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.color-button[style*='background-color: #FFFFFF'] {
  border: 2px solid #ccc;
}

.color-button[style*='background-color: #FFFFFF'].active {
  border-color: var(--orange-color);
}
</style>
