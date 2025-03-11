<template>
  <div class="grid-controls">
    <div class="control-group">
      <label>Деление сетки:</label>
      <select v-model="selectedDivision">
        <option :value="1">1</option>
        <option :value="2">1/2</option>
        <option :value="4">1/4</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useOrnamentStore } from '@/stores/ornament'

const store = useOrnamentStore()

const selectedDivision = computed({
  get: () => store.gridDivision,
  set: (value: number) => store.setGridDivision(value),
})
</script>

<style scoped>
.grid-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

select {
  padding: 5px;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  outline: none;
}
</style>
