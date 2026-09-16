/* Afficher uniquement les espaces enregistrés dans les favoris. */

async function initMesEspaces() {
    // Préparer les deux zones qui recevront le résultat.
    const liste = document.getElementById("liste-favoris");
    const feedback = document.getElementById("favoris-feedback");

    try {
        // Télécharger le même catalogue que la page d’accueil.
        const reponse = await fetch("../assets/data/espace.json");
        if (!reponse.ok) throw new Error(`Erreur HTTP ${reponse.status}`);

        const espaces = await reponse.json();
        const favoris = lireFavoris();
        const espacesFavoris = espaces.filter(espace => favoris.includes(espace.id));

        // Expliquer clairement pourquoi la liste peut être vide.
        if (espacesFavoris.length === 0) {
            feedback.innerHTML = '<p>Vous n’avez encore enregistré aucun espace.</p><a href="../index.html">Découvrir les espaces</a>';
            liste.replaceChildren();
            return;
        }

        feedback.textContent = `${espacesFavoris.length} espace(s) enregistré(s)`;
        afficherEspacesFavoris(espacesFavoris, liste);
    } catch (error) {
        console.error("Impossible de charger les favoris :", error);
        feedback.textContent = "Impossible de charger vos espaces pour le moment.";
    }
}

function afficherEspacesFavoris(espaces, conteneur) {
    // Fabriquer une carte simple pour chaque espace conservé.
    conteneur.replaceChildren();

    espaces.forEach(espace => {
        const article = document.createElement("article");
        article.className = "card-espace-wrapper";
        article.innerHTML = `
            <div class="card-image-wrapper">
                <img src="../${espace.image}" alt="${espace.nom} à ${espace.ville}" class="card-img">
            </div>
            <div class="card-content-wrapper">
                <h3 class="card-title">${espace.nom}</h3>
                <p>${espace.ville} ${espace.arrondissement || ""}</p>
                <p><strong>${espace.prix} €</strong> par heure</p>                
            </div>
            <div class="card-content-wrapper">                
                <a class="card-main-link" href="espace.html?id=${encodeURIComponent(espace.id)}">Voir la fiche</a>
                <button type="button" class="btn-retirer-favori" data-id="${espace.id}">Retirer des favoris</button>
            </div>
        `;
        conteneur.appendChild(article);
    });

    // Écouter les suppressions avec un seul gestionnaire.
    conteneur.addEventListener("click", event => {
        const bouton = event.target.closest(".btn-retirer-favori");
        if (!bouton) return;

        const nouvelleListe = lireFavoris().filter(id => id !== bouton.dataset.id);
        if (enregistrerFavoris(nouvelleListe)) {
            mettreAJourCompteurFavoris(nouvelleListe);
            initMesEspaces();
        }
    }, { once: true });
}

// Lancer l’affichage lorsque le document est prêt.
document.addEventListener("DOMContentLoaded", initMesEspaces);
