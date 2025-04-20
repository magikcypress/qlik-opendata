import { render, screen, fireEvent } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import WidgetsObjects from '@/components/widgetsObjects.vue'

describe('WidgetsObjects.vue', () => {
	it('affiche un message si aucune application correspondante n\'est trouvée', async () => {
		// Rendre le composant avec des props vides
		render(WidgetsObjects, {
			props: {
				application: '',
				quillInstance: null
			}
		})

		// Vérifiez que le message d'erreur s'affiche
		expect(screen.getByText(/Aucune application correspondante trouvée/i)).toBeTruthy()
	})

	it('affiche les applications filtrées', async () => {
		// Mock des données d'applications
		const applicationsData = [
			{ qId: '123', name: 'Application 1', sheets: [] },
			{ qId: '456', name: 'Application 2', sheets: [] }
		]

		// Rendre le composant avec des props
		render(WidgetsObjects, {
			props: {
				application: 'Application 1',
				quillInstance: null
			},
			global: {
				mocks: {
					applicationsData
				}
			}
		})

		// Vérifiez que l'application filtrée est affichée
		expect(screen.getByText(/Application 1/i)).toBeTruthy()
		expect(screen.queryByText(/Application 2/i)).toBeNull()
	})

	it('affiche les feuilles (sheets) d\'une application', async () => {
		// Mock des données d'applications avec des feuilles
		const applicationsData = [
			{
				qId: '123',
				name: 'Application 1',
				sheets: [
					{ qData: { name: 'Sheet1' }, qMeta: { title: 'Sheet 1 Title' } }
				]
			}
		]

		// Rendre le composant avec des props
		render(WidgetsObjects, {
			props: {
				application: 'Application 1',
				quillInstance: null
			},
			global: {
				mocks: {
					applicationsData
				}
			}
		})

		// Vérifiez que la feuille est affichée
		expect(screen.getByText(/Sheet 1 Title/i)).toBeTruthy()
	})
})