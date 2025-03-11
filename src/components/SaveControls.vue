<template>
  <div class="save-controls">
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
    <div class="buttons">
      <button class="action-button save-button" @click="saveImage">
        <span class="material-icons">download</span>
        Сохранить
      </button>
      <button class="action-button print-button" @click="printImage">
        <span class="material-icons">print</span>
        Печать
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrnamentStore } from '@/stores/ornament'
import { useImageGenerator } from '@/composables/useImageGenerator'

const store = useOrnamentStore()
const { saveImage, printImage } = useImageGenerator()
</script>

<style scoped>
.save-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  margin-top: 20px;
}

.text-controls {
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 800px;
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

.buttons {
  display: flex;
  gap: 10px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  outline: none;
}

.action-button:hover {
  transform: translateY(-1px);
}

.action-button:active {
  transform: translateY(0);
}

.save-button {
  background-color: var(--primary-color);
}

.save-button:hover {
  background-color: var(--secondary-color);
}

.print-button {
  background-color: #4caf50;
}

.print-button:hover {
  background-color: #45a049;
}

.material-icons {
  font-size: 20px;
}
</style>
