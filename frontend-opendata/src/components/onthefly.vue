<template>
	<h3>Creer un graphique a la volée</h3>
	{{ publication.qId }}
	<div class="wrapper">
		<div class="row">
			<h2 class="pb-2">Comment creer un graphique a la volée</h2>
			<div class="col-sm-7">
				<div class="qlik-embed-example" id="qlik-embed-container2">
					<qlik-embed id="onthefly" ui="analytics/chart" :app-id="`${publication.qId}`" type="barchart"
						dimensions=' ["[Machine Name]"]' measures='["[% Scrap]"]'>
					</qlik-embed>
				</div>
			</div>
			<div class="col-sm-5">
				<div class="row">
					<select class="form-select" id="dimDrop" required>
						<option value="">Dimension</option>
						<option>Machine Name</option>
						<option>Machine Age</option>
						<option>Work Shift</option>
						<option>Production Month Year</option>
					</select>
					<select class="form-select" id="measureDrop" required>
						<option value="">Measure</option>
						<option>% Scrap</option>
						<option>Avg Cycle Time</option>
						<option>N. Parts Produced</option>
					</select>
					<select class="form-select" id="chartDrop" required>
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