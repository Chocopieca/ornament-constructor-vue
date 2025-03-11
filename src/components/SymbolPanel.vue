<template>
  <div class="symbol-panel">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="symbols">
      <template v-if="activeTab === 'numbers'">
        <button
          v-for="number in numbers"
          :key="number"
          @click="placeSymbol(number)"
          class="symbol-button"
          tabindex="-1"
        >
          {{ number }}
        </button>
      </template>
      <template v-if="activeTab === 'latin'">
        <button
          v-for="letter in latinLetters"
          :key="letter"
          @click="placeSymbol(letter)"
          class="symbol-button"
          tabindex="-1"
        >
          {{ letter }}
        </button>
      </template>
      <template v-if="activeTab === 'ukrainian'">
        <button
          v-for="letter in ukrainianLetters"
          :key="letter"
          @click="placeSymbol(letter)"
          class="symbol-button"
          tabindex="-1"
        >
          {{ letter }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useOrnamentStore } from '@/stores/ornament'

const store = useOrnamentStore()
const activeTab = ref('numbers')

const tabs = [
  { id: 'numbers', label: 'Цифры' },
  { id: 'latin', label: 'Латиница' },
  { id: 'ukrainian', label: 'Українська' },
]

const numbers = Array.from({ length: 10 }, (_, i) => i)
const latinLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const ukrainianLetters = 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ'.split('')

const placeSymbol = (symbol: number | string) => {
  store.placeSymbol(symbol)
}
</script>

<style scoped>
.symbol-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.tabs button {
  padding: 5px 15px;
  border: 1px solid var(--primary-color);
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.tabs button.active {
  background: var(--primary-color);
  color: white;
}

.symbols {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.symbol-button {
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
  outline: none;
}

.symbol-button:hover {
  background: var(--primary-color);
  color: white;
}
</style>
