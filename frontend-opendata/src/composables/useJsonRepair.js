import { ref } from "vue";
import { jsonrepair } from "jsonrepair";

export function useJsonRepair() {
	const jsonData = ref(null);
	const error = ref(null);

	const validateAndRepairJSON = (jsonString) => {
		try {
			if (typeof jsonString !== 'string') {
				throw new Error('Input must be a string');
			}
			const repairedJson = jsonrepair(jsonString);
			jsonData.value = JSON.parse(repairedJson);
			error.value = null;
			return true;
		} catch (err) {
			error.value = `Invalid JSON: ${err.message}`;
			jsonData.value = null;
			return false;
		}
	};

	return {
		jsonData,
		error,
		validateAndRepairJSON
	};
}