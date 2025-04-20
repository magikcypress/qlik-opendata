import { render, screen, fireEvent } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import PublicationsEdit from '@/components/publicationsEdit.vue'

describe('PublicationsEdit.vue', () => {
	it('affiche le formulaire de modification', async () => {
		render(PublicationsEdit)

		// Vérifiez que les champs du formulaire sont affichés
		expect(screen.getByLabelText(/Titre/i)).toBeTruthy()
		expect(screen.getByLabelText(/Auteur/i)).toBeTruthy()
		expect(screen.getByLabelText(/Categorie/i)).toBeTruthy()
	})

	it('soumet le formulaire avec des données valides', async () => {
		render(PublicationsEdit)

		// Remplissez les champs du formulaire
		await fireEvent.update(screen.getByLabelText(/Titre/i), 'Titre de test')
		await fireEvent.update(screen.getByLabelText(/Auteur/i), 'Auteur de test')
		await fireEvent.update(screen.getByLabelText(/Categorie/i), 'Categorie de test')

		// Soumettez le formulaire
		await fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

		// Vérifiez que le formulaire a été soumis
		expect(screen.queryByText(/Publication mise à jour avec succès/i)).toBeTruthy()
	})
})