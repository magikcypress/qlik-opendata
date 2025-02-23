<template>
  <div>
    <h1>Qlik Sense Dashboard</h1>
    <div v-for="sheet in qlikData" :key="sheet.qInfo.qId" class="sheet">
      <h2>{{ sheet.qMeta.title }}</h2>
      <div class="details">
        <h3>Privileges</h3>
        <ul>
          <li v-for="privilege in sheet.qMeta.privileges" :key="privilege">
            {{ privilege }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      qlikData: [] // Initialize with an empty array
    };
  },
  created() {
    // Fetch JSON data from the local file
    fetch('../../data/example.json')
      .then(response => response.json())
      .then(data => {
        // Assign the JSON data to qlikData
        this.qlikData = data;
      })
      .catch(error => {
        console.error('Error loading JSON file:', error);
      });
  }
};
</script>

<style scoped>
.sheet {
  border: 1px solid #ddd;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
}

.details {
  padding-left: 20px;
}
</style>