import { render, screen, fireEvent } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import PublicationsAdd from '@/components/publicationsAdd.vue'

describe('PublicationsAdd.vue', () => {
	it('affiche le formulaire d\'ajout', async () => {
		render(PublicationsAdd)

		// Vérifiez que les champs du formulaire sont affichés
		expect(screen.getByLabelText(/Titre/i)).toBeTruthy()
		expect(screen.getByLabelText(/Auteur/i)).toBeTruthy()
		expect(screen.getByLabelText(/Categorie/i)).toBeTruthy()
	})

	it('soumet le formulaire avec des données valides', async () => {
		render(PublicationsAdd)

		// Remplissez les champs du formulaire
		await fireEvent.update(screen.getByLabelText(/Titre/i), 'Nouvelle publication')
		await fireEvent.update(screen.getByLabelText(/Auteur/i), 'Nouvel auteur')
		await fireEvent.update(screen.getByLabelText(/Categorie/i), 'Nouvelle categorie')

		// Soumettez le formulaire
		await fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

		// Vérifiez que le formulaire a été soumis
		expect(screen.queryByText(/Publication ajoutée avec succès/i)).toBeTruthy()
	})
})