/* Préremplir et vérifier le formulaire de contact dans le navigateur. */

function preRemplirSujet() {
    // Lire le nom transmis depuis la fiche espace.
    const parametresUrl = new URLSearchParams(window.location.search);
    const nomEspace = parametresUrl.get("espace");
    const sujet = document.getElementById("contact-subject");

    if (nomEspace && sujet) sujet.value = `Demande pour ${nomEspace}`;
}

function afficherErreur(champ, message) {
    // Écrire l’erreur dans la zone placée sous le champ.
    const zoneErreur = document.getElementById(`error-${champ.id.replace("contact-", "")}`);
    if (zoneErreur) zoneErreur.textContent = message;
}

function validerChamp(champ) {
    // Vérifier une valeur obligatoire sans envoyer de données au serveur.
    const valeur = champ.type === "checkbox" ? champ.checked : champ.value.trim();
    let message = "";

    if (champ.required && !valeur) message = "Ce champ est obligatoire.";
    if (!message && champ.type === "email" && !champ.validity.valid) message = "Saisissez une adresse email valide.";

    afficherErreur(champ, message);
    return message === "";
}

function activerValidationFormulaire() {
    // Écouter la tentative d’envoi du formulaire.
    const formulaire = document.getElementById("form-contact-b2b");
    const feedback = document.getElementById("form-feedback-zone");
    if (!formulaire || !feedback) return;

    formulaire.addEventListener("submit", event => {
        event.preventDefault();

        const champs = [...formulaire.querySelectorAll("[required]")];
        const formulaireValide = champs.map(validerChamp).every(Boolean);

        if (!formulaireValide) {
            feedback.textContent = "Corrigez les champs signalés avant l’envoi.";
            formulaire.querySelector(":invalid")?.focus();
            return;
        }

        // Simuler une confirmation sans contacter de serveur.
        feedback.textContent = "Votre message a bien été préparé. Merci !";
        formulaire.reset();
    });
}

// Activer les fonctions lorsque le document est prêt.
document.addEventListener("DOMContentLoaded", () => {
    preRemplirSujet();
    activerValidationFormulaire();
});
