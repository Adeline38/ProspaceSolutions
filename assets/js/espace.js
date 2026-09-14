/* Lire l’identifiant demandé dans l’adresse de la page. */

function afficherErreurFiche(message) {
    // Afficher une explication dans la zone prévue.
    const zone = document.getElementById("fiche-loading-zone");
    if (zone) zone.textContent = message;
}

function initFicheEspace() {
    // Extraire le paramètre id avec l’API URLSearchParams.
    const parametresUrl = new URLSearchParams(window.location.search);
    const espaceId = parametresUrl.get("id");

    if (!espaceId) {
        afficherErreurFiche("Aucun identifiant d’espace n’est présent dans l’adresse.");
        return;
    }

    // Préparer le futur chargement du fichier JSON.
    const zone = document.getElementById("fiche-loading-zone");
    if (zone) zone.textContent = `Identifiant demandé : ${espaceId}`;
}

// Lancer la lecture lorsque le document est prêt.
document.addEventListener("DOMContentLoaded", initFicheEspace);
