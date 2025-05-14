<template>
	<h2>Creer un graphique a la volée</h2>
	<div class="wrapper">
		<div class="row">
			<div class="col-sm-7">
				<div class="qlik-embed" id="qlik-embed-container2">
                    <qlik-embed
                        id="onthefly"
                        ui="analytics/chart"
                        :app-id="publication.qId"
                        :type="selectedChartType"
						:dimensions='[selectedDimension]' 
						:measures='[selectedMeasure]'>
                    </qlik-embed>
				</div>
			</div>
            <div class="col-sm-5">
                <div class="row">
                    <select class="form-select custom-select" v-model="selectedDimension" required>
                        <option value="">Dimension</option>
                        <option value='["[Année]"]'>Année</option>
                        <option value='["[Commune_Rue]"]'>Commune_Rue</option>
                    </select>
                    <select class="form-select custom-select" v-model="selectedMeasure" required>
                        <option value="">Mesure</option>
                        <option value='["[Nb de Mutation]"]'>Nb de Mutation</option>
                        <option value='["[Nb de transaction]"]'>Nb de transaction</option>
                        <option value='["[Prix M2]"]'>Prix M2</option>
                    </select>
                    <select class="form-select custom-select" v-model="selectedChartType" required>
                        <option value="">Chart options</option>
                        <option value="barchart">Barchart</option>
                        <option value="linechart">Linechart</option>
                        <option value="piechart">Piechart</option>
                        <option value="table">Table</option>
                    </select>
                </div>
            </div>
		</div>
	</div>

</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
	publication: {
		type: Object,
		required: true,
	},
})

const selectedDimension = ref('["[Année]"]');
const selectedMeasure = ref('["[Nb de Mutation]"]');
const selectedChartType = ref('barchart');

watch([selectedDimension, selectedMeasure, selectedChartType], ([dimension, measure, chartType]) => {
    if (dimension && measure && chartType) {
        console.log(`Graphique mis à jour : Dimension=${dimension}, Mesure=${measure}, Type=${chartType}`);
    }
});
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

.qlik-embed {
	height: 400px;
}

/* Responsive pour les petits écrans */
@media (max-width: 768px) {
    .row {
        flex-direction: column;
    }
}
</style>