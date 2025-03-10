<template>
  <div class="number-panel">
    <button 
      v-for="number in numbers" 
      :key="number"
      @click="placeNumber(number)"
      class="number-button"
    >
      {{ number }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useOrnamentStore } from '@/stores/ornament'

const store = useOrnamentStore()
const numbers = Array.from({ length: 10 }, (_, i) => i)

const placeNumber = (number: number) => {
  store.placeNumber(number)
}
</script>

<style scoped>
.number-panel {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.number-button {
  width: 40px;
  height: 40px;
  border: 2px solid var(--primary-color);
  background: white;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.number-button:hover {
  background: var(--primary-color);
  color: white;
}
</style> 