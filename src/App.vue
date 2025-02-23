<template>
  <h1>Qlik Sense Dashboard</h1>
  <div id="app">
    <Sheets />
    <Objects />
    <Dimensions />
    <Measures />
  </div>
</template>

<script>
import Sheets from '@/components/sheets.vue';
import Objects from '@/components/objects.vue';
import Dimensions from '@/components/dimensions.vue';
import Measures from '@/components/measures.vue';

export default {
  name: 'App',
  components: {
    Sheets,
    Objects,
    // Dimensions,
    // Measures
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>