<template>
	<h2>Creer un graphique a la volée</h2>
	{{ publication.qId }}
	<div class="wrapper">
		<div class="row">
			<div class="col-sm-7">
				<div class="qlik-embed-example" id="qlik-embed-container2">
					<qlik-embed id="onthefly" ui="analytics/chart" :app-id="`${publication.qId}`" type="barchart"
						dimensions=' ["[Machine Name]"]' measures='["[% Scrap]"]'>
					</qlik-embed>
				</div>
			</div>
			<div class="col-sm-5">
				<div class="row">
					<select class="form-select custom-select" id="dimDrop" required>
						<option value="">Dimension</option>
						<option>Machine Name</option>
						<option>Machine Age</option>
						<option>Work Shift</option>
						<option>Production Month Year</option>
					</select>
					<select class="form-select custom-select" id="measureDrop" required>
						<option value="">Measure</option>
						<option>% Scrap</option>
						<option>Avg Cycle Time</option>
						<option>N. Parts Produced</option>
					</select>
					<select class="form-select custom-select" id="chartDrop" required>
						<option value="">Chart options</option>
						<option>barchart</option>
						<option>linechart</option>
						<option>piechart</option>
						<option>table</option>
					</select>
					<div class="code-example">
						<pre><code id="ontheflyCode" style="text-wrap: wrap;">
&lt;qlik-embed
id = "onthefly"
ui="analytics/chart"
app-id="96d75270-ebef-4e94-93c5-2f9ea68c3958"
type="barchart"
dimensions='["[Machine Name]"]'
measures='["[% Scrap]"]'
&gt;
&lt;/qlik-embed&gt;
                </code></pre>
					</div>
				</div>
			</div>
		</div>
	</div>

</template>

<script setup>
const props = defineProps({
	publication: {
		type: Object,
		required: true,
	},
})
</script>

<style scoped>
.custom-select {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
    font-size: 1rem;
    color: #333;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

/* Focus sur le sélecteur */
.custom-select:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    outline: none;
}

/* Style pour les options */
.custom-select option {
    padding: 10px;
}

/* Alignement des sélecteurs */
.row {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* Responsive pour les petits écrans */
@media (max-width: 768px) {
    .row {
        flex-direction: column;
    }
}
</style>