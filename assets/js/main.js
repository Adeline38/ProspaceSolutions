/* Afficher, filtrer et rendre les cartes de l’accueil enregistrables. */

function mettreAJourBoutonsFavoris(targetContainer, listeEspaces) {
    // Synchroniser les cœurs avec la liste commune des favoris.
    if (!targetContainer) return;

    const favoris = lireFavoris();

    targetContainer.querySelectorAll(".btn-favoris").forEach(button => {
        const espaceId = button.dataset.id;
        const espace = listeEspaces.find(item => item.id === espaceId);
        const estFavori = favoris.includes(espaceId);
        const nomEspace = espace ? espace.nom : "cet espace";

        button.setAttribute("aria-pressed", String(estFavori));
        button.setAttribute(
            "aria-label",
            estFavori
                ? `Retirer ${nomEspace} des favoris`
                : `Ajouter ${nomEspace} aux favoris`
        );
        button.setAttribute(
            "title",
            estFavori ? "Retirer des favoris" : "Ajouter aux favoris"
        );
        button.classList.toggle("is-active", estFavori);
    });

}

function basculerFavori(espaceId) {
    // Ajouter ou retirer un identifiant puis sauvegarder la liste.
    const favoris = lireFavoris();
    const estDejaFavori = favoris.includes(espaceId);
    const nouvelleListe = estDejaFavori
        ? favoris.filter(id => id !== espaceId)
        : [...favoris, espaceId];

    return enregistrerFavoris(nouvelleListe);
}

function activerGestionFavoris(targetContainer, listeEspaces) {
    // Écouter les clics sur tous les cœurs de la grille.
    if (!targetContainer) return;

    targetContainer.addEventListener("click", event => {
        const button = event.target.closest(".btn-favoris");

        if (!button || !targetContainer.contains(button)) return;

        const espaceId = button.dataset.id;

        if (!espaceId) return;

        if (basculerFavori(espaceId)) {
            mettreAJourBoutonsFavoris(targetContainer, listeEspaces);
            mettreAJourCompteurFavoris();
        }
    });

    window.addEventListener("storage", event => {
        if (event.key === FAVORIS_STORAGE_KEY) {
            mettreAJourBoutonsFavoris(targetContainer, listeEspaces);
        }
    });
}

async function initCatalogue() {
    // Charger le catalogue puis activer les filtres et les favoris.

    document.title = "Location d'Espaces de Travail Flexibles & Salles de Réunion | ProSpace Solutions";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", "Réservez vos salles de réunion, bureaux privatifs et espaces de coworking à la demande dans les grandes villes de France. Solutions flexibles pour professionnels B2B.");
    }

    const container = document.querySelector(".catalogue__wrapper");
    const filterForm = document.querySelector(".filtre__wrapper");

    const villeSelect = document.getElementById("ville-select");
    const capaciteSelect = document.getElementById("capacite-select");
    const wifiCheckbox = document.querySelector('input[name="wifi"]');
    const pmrCheckbox = document.querySelector('input[name="pmr"]');
    const screenCheckbox = document.querySelector('input[name="screen"]');

    let totalEspaces = [];

    const spinnerContainer = document.createElement("div");

    spinnerContainer.classList.add("spinner-wrapper");
    spinnerContainer.style.gridColumn = "1 / -1";
    spinnerContainer.style.display = "flex";
    spinnerContainer.style.flexDirection = "column";
    spinnerContainer.style.alignItems = "center";
    spinnerContainer.style.justifyContent = "center";
    spinnerContainer.style.gap = "16px";
    spinnerContainer.style.padding = "40px";
    spinnerContainer.style.width = "100%";

    spinnerContainer.innerHTML = `
        <div class="spinner"></div>
        <p style="font-size: 1.2rem; color: #0066ff; font-weight: bold; margin: 0;">
            Chargement des espaces...
        </p>
    `;

    if (container) {

        container.appendChild(spinnerContainer);
    }

    try {

        await new Promise(resolve => setTimeout(resolve, 600));

        const response = await fetch("assets/data/espace.json");
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
        }

        totalEspaces = await response.json();

        if (spinnerContainer) spinnerContainer.style.display = "none";

        renderEspaces(totalEspaces, container);
        activerGestionFavoris(container, totalEspaces);

        if (filterForm) {

            filterForm.addEventListener("change", () => {

                filtrerCatalogue(totalEspaces, container, {
                    ville: villeSelect.value,
                    capacite: capaciteSelect.value,
                    wifi: wifiCheckbox.checked,
                    pmr: pmrCheckbox.checked,
                    screen: screenCheckbox.checked
                });
            });
        }

    } catch (error) {

        console.error("Impossible de charger le catalogue ProSpace :", error);

        if (spinnerContainer) spinnerContainer.style.display = "none";

        if (container) {
            container.innerHTML = `
                <div class="error-message" role="alert">
                    <p>Une erreur est survenue lors du chargement des espaces de travail. Veuillez recharger la page ou réessayer ultérieurement.</p>
                </div>
            `;
        }
    }
}

function renderEspaces(listeEspaces, targetContainer) {
    // Créer les cartes correspondant à la liste reçue.

    if (!targetContainer) return;

    targetContainer.innerHTML = "";

    if (listeEspaces.length === 0) {

        targetContainer.innerHTML = `
            <div class="no-results" role="alert">
                <p>Aucun espace de travail ne correspond à vos critères de recherche.</p>
            </div>
        `;
        return;
    }

    listeEspaces.forEach(espace => {
        const article = document.createElement("article");
        article.classList.add("card-espace-wrapper");

        const tagsHTML = espace.equipements.map(item => {

            let svgIcon = "";

            if (item === "Fibre") {
                svgIcon = `<svg aria-hidden="true" focusable="false" xmlns="http://w3.org" width="15" height="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon-svg lucide lucide-wifi" viewBox="0 0 24 24"><path d="M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.859a10 10 0 0 1 14 0M8.5 16.429a5 5 0 0 1 7 0"/></svg>`;

            } else if (item === "PMR") {
                svgIcon = `<svg aria-hidden="true" focusable="false" xmlns="http://w3.org" width="15" height="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon-svg lucide lucide-accessibility" viewBox="0 0 24 24"><circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1M5 8l3-3 5.5 3-2.36 3.5M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/></svg>`;

            } else if (item === "4K") {
                svgIcon = `<svg aria-hidden="true" focusable="false" xmlns="http://w3.org" width="15" height="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon-svg lucide lucide-monitor" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`;
            }

            return `
                <span class="tag">
                    ${svgIcon}
                    ${item}
                </span>
            `;
        }).join("");

        article.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${espace.image}" alt="Espace ${espace.nom} - ${espace.description}" class="card-img" loading="lazy">
                
                <button type="button" class="btn-favoris" aria-label="Ajouter ${espace.nom} aux favoris" aria-pressed="false" data-id="${espace.id}">
                    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon-svg lucide lucide-heart" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
            </div>
            
            <div class="card-content-wrapper">
                <h3 class="card-title">${espace.nom}</h3>
                
                <div class="card-location">
                    <svg aria-hidden="true" focusable="false" class="icon-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>${espace.ville}${espace.arrondissement ? " " + espace.arrondissement : ""}</span>
                </div>
                
                <div class="card-rating">
                    <div class="stars" aria-hidden="true">
                        <span>
                            <svg aria-hidden="true" focusable="false" xmlns="http://w3.org" width="15" height="15" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon-svg lucide lucide-star" viewBox="0 0 24 24"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"/></svg>
                        </span>
                    </div>
                    <strong class="rating-value">${espace.note.toFixed(1)}</strong>
                    <span class="rating-count">(${espace.avis} avis)</span>
                </div>
                
                <div class="card-details-row">
                    <div class="card-capacite">
                        <svg aria-hidden="true" focusable="false" xmlns="http://w3.org" width="15" height="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon-svg lucide lucide-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <span id="nb-capacite">${espace.capacite}</span><span>pers.</span>
                    </div>
                    <div class="card-tags">
                        ${tagsHTML}
                    </div>
                </div>
                
                <hr class="card-sep" aria-hidden="true">
                
                <div class="card-footer-row">
                    <div class="card-price">
                        <span class="price-amount">${espace.prix}€</span>
                        <span class="price-unit">/heure</span>
                    </div>
                    
                    <a href="pages/espace.html?id=${espace.id}" class="card-main-link" title="Consulter la fiche détaillée de l'espace ${espace.nom}">Voir la fiche</a>
                </div>
            </div>
        `;

        targetContainer.appendChild(article);
    });

    mettreAJourBoutonsFavoris(targetContainer, listeEspaces);
}

function filtrerCatalogue(listeComplete, targetContainer, criteres) {
    // Conserver uniquement les espaces correspondant à tous les critères.

    let espacesFiltres = listeComplete;

    if (criteres.ville !== "") {

        espacesFiltres = espacesFiltres.filter(espace => {

            if (criteres.ville === "paris8") return espace.ville === "Paris" && espace.arrondissement === "8e";

            if (criteres.ville === "paris11") return espace.ville === "Paris" && espace.arrondissement === "11e";

            if (criteres.ville === "lyon2") return espace.ville === "Lyon" && espace.arrondissement === "2e";

            return espace.ville.toLowerCase() === criteres.ville.toLowerCase();
        });
    }

    if (criteres.capacite !== "") {

        const mincapacite = parseInt(criteres.capacite, 10);

        espacesFiltres = espacesFiltres.filter(espace => espace.capacite >= mincapacite);
    }

    if (criteres.wifi) {

        espacesFiltres = espacesFiltres.filter(espace => espace.equipements.includes("Fibre"));
    }

    if (criteres.pmr) {

        espacesFiltres = espacesFiltres.filter(espace => espace.equipements.includes("PMR"));
    }

    if (criteres.screen) {

        espacesFiltres = espacesFiltres.filter(espace => espace.equipements.includes("4K"));
    }

    renderEspaces(espacesFiltres, targetContainer);
}

document.addEventListener("DOMContentLoaded", () => {

    initCatalogue();
});
