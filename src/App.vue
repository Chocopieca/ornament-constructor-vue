<template>
  <div class="app">
    <h1 class="app-title">Ornament Constructor</h1>
    <div class="content">
      <SymbolPanel />
      <ColorPanel />
      <Grid />
      <SaveControls />
    </div>
  </div>
</template>

<script setup lang="ts">
import Grid from '@/components/Grid.vue'
import SymbolPanel from '@/components/SymbolPanel.vue'
import ColorPanel from '@/components/ColorPanel.vue'
import SaveControls from '@/components/SaveControls.vue'
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-title {
  text-align: center;
}

.content {
  margin-top: 20px;
}
</style>
