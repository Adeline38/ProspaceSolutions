/* Charger le JSON puis remplir la fiche demandée dans l’URL. */

function afficherErreurFiche(message) {
    // Remplacer le chargement par une explication simple.
    const zone = document.getElementById("fiche-loading-zone");
    if (!zone) return;

    zone.innerHTML = `<div class="error-message"><strong>Erreur de chargement</strong><p>${message}</p><a href="../index.html">Retourner à l’accueil</a></div>`;
}

async function initFicheEspace() {
    // Extraire l’identifiant présent dans l’adresse.
    const parametresUrl = new URLSearchParams(window.location.search);
    const espaceId = parametresUrl.get("id");
    const zoneChargement = document.getElementById("fiche-loading-zone");
    const zoneContenu = document.getElementById("fiche-content-zone");

    if (!espaceId) {
        afficherErreurFiche("Aucun identifiant d’espace n’est présent dans l’adresse.");
        return;
    }

    // Signaler que les données sont en cours de téléchargement.
    zoneChargement.innerHTML = '<div class="spinner" aria-hidden="true"></div><p>Chargement de la fiche…</p>';

    try {
        // Télécharger la liste des espaces.
        const reponse = await fetch("../assets/data/espace.json");
        if (!reponse.ok) throw new Error(`Erreur HTTP ${reponse.status}`);

        const espaces = await reponse.json();
        const espace = espaces.find(item => item.id === espaceId);
        if (!espace) throw new Error("L’espace demandé est introuvable.");

        // Afficher seulement la fiche qui correspond à l’identifiant.
        alimenterDonneesFiche(espace);
        zoneChargement.replaceChildren();
        zoneContenu.hidden = false;
    } catch (error) {
        console.error("Impossible de charger la fiche :", error);
        afficherErreurFiche(error.message);
    }
}

function creerIconeEquipement(equipement) {
    // Choisir un dessin selon le nom de l’équipement.
    const icones = {
        Fibre: '<svg aria-hidden="true" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.86a10 10 0 0 1 14 0M8.5 16.43a5 5 0 0 1 7 0"/></svg>',
        PMR: '<svg aria-hidden="true" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1M5 8l3-3 5.5 3-2.36 3.5"/></svg>',
        "4K": '<svg aria-hidden="true" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg>'
    };
    return icones[equipement] || "";
}

function alimenterDonneesFiche(espace) {
    // Adapter les métadonnées de la fiche.
    document.title = `${espace.nom} - Salle de réunion ${espace.capacite} p. | ProSpace Solutions`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = `Découvrir ${espace.nom} à ${espace.ville}, pour ${espace.capacite} personnes.`;

    // Injecter les textes dans les emplacements HTML.
    document.querySelector(".dynamic-breadcrumb-city").textContent = espace.ville;
    document.querySelector(".dynamic-breadcrumb-name").textContent = espace.nom;
    document.querySelector(".dynamic-name").textContent = espace.nom;
    document.querySelector(".dynamic-address").textContent = `${espace.ville} ${espace.arrondissement || ""}`.trim();
    document.querySelector(".dynamic-note").textContent = espace.note.toFixed(1);
    document.querySelector(".dynamic-avis").textContent = `${espace.avis} avis vérifiés`;
    document.querySelector(".dynamic-description").textContent = espace.description;
    document.querySelector(".dynamic-capacity").textContent = espace.capacite;

    // Calculer les forfaits depuis le tarif horaire.
    document.querySelector(".price-hour").textContent = `${espace.prix} € HT`;
    document.querySelector(".price-half").textContent = `${espace.prix * 4 - 20} € HT`;
    document.querySelector(".price-day").textContent = `${espace.prix * 8 - 80} € HT`;

    // Remplir les trois emplacements de la galerie.
    const images = espace.images || [espace.image, espace.image, espace.image];
    ["vue principale", "vue intérieure", "vue détaillée"].forEach((description, index) => {
        const image = document.getElementById(`gallery-img-${index + 1}`);
        image.src = `../${images[index] || espace.image}`;
        image.alt = `${espace.nom} — ${description}`;
    });

    // Créer une ligne pour chaque équipement.
    const liste = document.querySelector(".dynamic-equipments-list");
    liste.replaceChildren();
    espace.equipements.forEach(equipement => {
        const element = document.createElement("li");
        element.innerHTML = `${creerIconeEquipement(equipement)}<span>${equipement}</span>`;
        liste.appendChild(element);
    });
}

// Lancer le chargement lorsque le document est prêt.
document.addEventListener("DOMContentLoaded", initFicheEspace);
