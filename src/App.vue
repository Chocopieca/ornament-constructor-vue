<template>
  <div class="app">
    <h1>Ornament Constructor</h1>
    <div class="content">
      <NumberPanel />
      <ColorPanel />
      <Grid />
    </div>
  </div>
</template>

<script setup lang="ts">
import Grid from '@/components/Grid.vue'
import NumberPanel from '@/components/NumberPanel.vue'
import ColorPanel from '@/components/ColorPanel.vue'
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.content {
  margin-top: 20px;
}
</style>
