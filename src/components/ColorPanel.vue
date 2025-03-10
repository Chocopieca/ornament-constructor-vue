<template>
  <div class="color-panel">
    <button 
      v-for="color in colors" 
      :key="color"
      :style="{ backgroundColor: color }"
      :class="{ active: isSelected(color) }"
      class="color-button"
      @click="selectColor(color)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useOrnamentStore } from '@/stores/ornament'

const store = useOrnamentStore()

const colors = [
  '#35495e', // default
  '#42b883', // green
  '#ee6b00', // orange
  '#dd4c4f', // red
  '#3eaf7c', // vue green
  '#304455', // dark blue
  '#2c3e50', // vue dark
  '#00c58e'  // nuxt green
]

const isSelected = (color: string) => store.selectedColor === color
const selectColor = (color: string) => store.setColor(color)
</script>

<style scoped>
.color-panel {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 10px 0;
}

.color-button {
  width: 30px;
  height: 30px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.color-button:hover {
  transform: scale(1.1);
}

.color-button.active {
  border-color: var(--orange-color);
  transform: scale(1.1);
}
</style> 