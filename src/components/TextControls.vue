<template>
  <div class="text-controls">
    <div class="text-input">
      <label>Верхний текст:</label>
      <input v-model="store.topText" type="text" placeholder="Введите текст" />
    </div>
    <div class="text-input">
      <label>Нижний текст:</label>
      <input v-model="store.bottomText" type="text" placeholder="Введите текст" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrnamentStore } from '@/stores/ornament'

const store = useOrnamentStore()
</script>

<style scoped>
.text-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.text-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

label {
  font-weight: 500;
}

input {
  padding: 8px;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: var(--orange-color);
  box-shadow: 0 0 5px rgba(238, 107, 0, 0.2);
}
</style>
