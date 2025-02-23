import { ref } from "vue";
import jsonlint from "jsonlint";

export function useJsonLint() {
	const jsonData = ref(null);
	const error = ref(null);

	const validateJSON = (jsonString) => {
		try {
			jsonData.value = jsonlint.parse(jsonString);
			error.value = null;
			return true;
		} catch (err) {
			error.value = `Invalid JSON: ${err.message}`;
			jsonData.value = null;
			return false;
		}
	};

	const correctJSON = (jsonString) => {
		try {
			const parsedData = jsonlint.parse(jsonString);
			jsonData.value = JSON.stringify(parsedData, null, 2); // Beautify JSON
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
		validateJSON,
		correctJSON
	};
}