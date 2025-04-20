import { render, screen, fireEvent } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import PublicationsList from '@/components/publicationsList.vue'

describe('PublicationsList.vue', () => {
	it('affiche une liste de publications', async () => {
		// Mock des publications
		const publications = [
			{ _id: '1', title: 'Publication 1', author: 'Auteur 1' },
			{ _id: '2', title: 'Publication 2', author: 'Auteur 2' }
		]

		render(PublicationsList, {
			global: {
				mocks: {
					publications
				}
			}
		})

		// Vérifiez que les publications sont affichées
		expect(screen.getByText(/Publication 1/i)).toBeTruthy()
		expect(screen.getByText(/Publication 2/i)).toBeTruthy()
	})

	it('supprime une publication', async () => {
		// Mock des publications
		const publications = [
			{ _id: '1', title: 'Publication 1', author: 'Auteur 1' }
		]

		render(PublicationsList, {
			global: {
				mocks: {
					publications
				}
			}
		})

		// Cliquez sur le bouton "Supprimer"
		await fireEvent.click(screen.getByRole('button', { name: /Supprimer/i }))

		// Vérifiez que la publication a été supprimée
		expect(screen.queryByText(/Publication 1/i)).toBeNull()
	})
})