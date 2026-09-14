/* ================================================= 

Rôle : Gérer de manière dynamique et asynchrone le chargement, l'affichage en grille et le filtrage multi-critères du catalogue des espaces de travail sur la page d'accueil

/* ================================================= 

- initCatalogue() : Modifier le titre/descript de la page, télécharger la liste des salles, l'afficher et activer le système de recherche
- renderEspaces() : Génèrer et injecter les fiches de toutes les salles disponibles dans la grille de la page
- filtrerCatalogue() : Faire un tri croisé dans la liste des salles en fonction des choix de l'utilisateur

*/

const FAVORIS_STORAGE_KEY = "prospace_favoris";

// Lire les favoris enregistrés dans le navigateur sans bloquer la page
// si le stockage est vide, indisponible ou contient une ancienne valeur incorrecte.
function lireFavoris() {
    try {
        const valeurStockee = localStorage.getItem(FAVORIS_STORAGE_KEY);
        const favoris = valeurStockee ? JSON.parse(valeurStockee) : [];

        if (!Array.isArray(favoris)) return [];

        return [...new Set(favoris.filter(id => typeof id === "string"))];
    } catch (error) {
        console.warn("Impossible de lire les favoris ProSpace :", error);
        return [];
    }
}

// Enregistrer la nouvelle liste et indiquer si l'opération a réussi.
function enregistrerFavoris(favoris) {
    try {
        localStorage.setItem(FAVORIS_STORAGE_KEY, JSON.stringify(favoris));
        return true;
    } catch (error) {
        console.error("Impossible d'enregistrer les favoris ProSpace :", error);
        return false;
    }
}

function mettreAJourCompteurFavoris(favoris = lireFavoris()) {
    const compteur = document.querySelector('.navigation a[href*="mes-espaces"] span');

    if (compteur) compteur.textContent = favoris.length;
}

// Synchroniser l'apparence et les textes accessibles de tous les cœurs affichés.
function mettreAJourBoutonsFavoris(targetContainer, listeEspaces) {
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

    mettreAJourCompteurFavoris(favoris);
}

function basculerFavori(espaceId) {
    const favoris = lireFavoris();
    const estDejaFavori = favoris.includes(espaceId);
    const nouvelleListe = estDejaFavori
        ? favoris.filter(id => id !== espaceId)
        : [...favoris, espaceId];

    return enregistrerFavoris(nouvelleListe);
}

// Un seul écouteur sur la grille suffit, même quand les filtres recréent les cartes.
function activerGestionFavoris(targetContainer, listeEspaces) {
    if (!targetContainer) return;

    targetContainer.addEventListener("click", event => {
        const button = event.target.closest(".btn-favoris");

        if (!button || !targetContainer.contains(button)) return;

        const espaceId = button.dataset.id;

        if (!espaceId) return;

        if (basculerFavori(espaceId)) {
            mettreAJourBoutonsFavoris(targetContainer, listeEspaces);
        }
    });

    // Mettre la page à jour si les favoris changent dans un autre onglet.
    window.addEventListener("storage", event => {
        if (event.key === FAVORIS_STORAGE_KEY) {
            mettreAJourBoutonsFavoris(targetContainer, listeEspaces);
        }
    });
}

async function initCatalogue() {
    // Rôle : Modifier le titre/descript de la page, télécharger la liste des salles, l'afficher et activer le système de recherche
    // Paramètres : Aucun paramètre d'entrée

    // Métadonnées SEO Dynamiques (US-10)
    // Changer le titre tout en haut de l'onglet du navigateur pour Google
    document.title = "Location d'Espaces de Travail Flexibles & Salles de Réunion | ProSpace Solutions";
    
    // Modification de la méta-description pour Google
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", "Réservez vos salles de réunion, bureaux privatifs et espaces de coworking à la demande dans les grandes villes de France. Solutions flexibles pour professionnels B2B.");
    }

    // Sélectionner les éléments HTML de l'écran (la grille pour les salles et le bloc pour les filtres)
    const container = document.querySelector(".catalogue__wrapper");
    const filterForm = document.querySelector(".filtre__wrapper");

    // Récupération des éléments du formulaire de filtres
    const villeSelect = document.getElementById("ville-select");
    const capaciteSelect = document.getElementById("capacite-select");
    const wifiCheckbox = document.querySelector('input[name="wifi"]');
    const pmrCheckbox = document.querySelector('input[name="pmr"]');
    const screenCheckbox = document.querySelector('input[name="screen"]');

    // Afficher immédiatement le nombre de favoris déjà mémorisés.
    mettreAJourCompteurFavoris();

    // Préparer une liste vide en mémoire pour ranger toutes nos salles plus tard
    let totalEspaces = [];

    // Créer une nouvelle boîte invisible dans la mémoire locale pour fabriquer notre chargement d'attente
    // On crée un conteneur global pour centrer les éléments proprement
    const spinnerContainer = document.createElement("div");
    // Configurer le style de la boîte pour que tout soit parfaitement centré et joli
    spinnerContainer.classList.add("spinner-wrapper");
    spinnerContainer.style.gridColumn = "1 / -1";
    spinnerContainer.style.display = "flex";
    spinnerContainer.style.flexDirection = "column";
    spinnerContainer.style.alignItems = "center";
    spinnerContainer.style.justifyContent = "center";
    spinnerContainer.style.gap = "16px";
    spinnerContainer.style.padding = "40px";
    spinnerContainer.style.width = "100%";

    // Injecte d'un côté le cercle animé et de l'autre le texte d'accessibilité pour rassurer l'utilisateur (US-04)
    spinnerContainer.innerHTML = `
        <div class="spinner"></div>
        <p style="font-size: 1.2rem; color: #0066ff; font-weight: bold; margin: 0;">
            Chargement des espaces...
        </p>
    `;


    // Affichage du feedback de chargement (US-04)
    // Vérifier si la grille principale existe sur la page avant de travailler
    if (container) {
        // Accrocher l'animation de chargmeent tout en haut de la grille pour faire patienter le visiteur
        container.appendChild(spinnerContainer);
    }

    // Essayer de dérouler le chargement en surveillant s'il y a un bug de réseau
    try {
        // Simulation d'un délai réseau de 600ms pour voir le spinner
        await new Promise(resolve => setTimeout(resolve, 600));

        // Requête AJAX asynchrone
        // Envoyer une requête asynchrone pour télécharger le fichier de données
        const response = await fetch("assets/data/espace.json");
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
        }

        // Traduire le fichier JSON reçu en une vraie liste d'objets manipulable par le script
        totalEspaces = await response.json();

        // Masquage du spinner après résolution de la promesse
        // Faire disparaître l'animation de chargement et le texte puisque le téléchargement est fini
        if (spinnerContainer) spinnerContainer.style.display = "none";

        // Lancement de l'affichage dans le DOM
        // Déclencher l'injection automatique de toutes les cartes de salles sur notre page web
        renderEspaces(totalEspaces, container);
        activerGestionFavoris(container, totalEspaces);

        // Écouteur d'événements pour le filtrage en temps réel (US-03)
        // Activer la surveillance du formulaire si le bloc des filtres existe
        if (filterForm) {
            // Écouter le moindre changement sur les cases à cocher ou les listes déroulantes (US-03)
            filterForm.addEventListener("change", () => {
                // Relancer le tri du catalogue en transmettant l'état exact de chaque filtre sélectionné
                filtrerCatalogue(totalEspaces, container, {
                    ville: villeSelect.value,
                    capacite: capaciteSelect.value,
                    wifi: wifiCheckbox.checked,
                    pmr: pmrCheckbox.checked,
                    screen: screenCheckbox.checked
                });
            });
        }

    // Intercepter la panne si le bloc "try" a rencontré un problème ou a planté
    } catch (error) {
        // Afficher le détail technique du bug dans la console de développement secrète
        console.error("Impossible de charger le catalogue ProSpace :", error);
        // Cacher immédiatement le rond qui tourne pour ne pas bloquer l'écran pour rien
        if (spinnerContainer) spinnerContainer.style.display = "none";
        
        // Affichage d'un message d'erreur accessible dans le DOM
        // Remplacer le catalogue par un message d'erreur accessible pour avertir l'utilisateur (US-04)
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
    // Rôle : Génèrer et injecter les fiches de toutes les salles disponibles dans la grille de la page
    // Paramètres : la liste des espaces (tableau) et le conteneur HTML de destination
    
    // Annuler immédiatement l'action si la zone de l'écran n'existe pas
    if (!targetContainer) return;

    // Sécurité : On vide le conteneur avant d'injecter
    targetContainer.innerHTML = "";

    // Gestion de l'état "Aucun résultat" (US-04)
    if (listeEspaces.length === 0) {
        // Afficher un message écrit pour prévenir l'utilisateur qu'on n'a rien trouvé
        targetContainer.innerHTML = `
            <div class="no-results" role="alert">
                <p>Aucun espace de travail ne correspond à vos critères de recherche.</p>
            </div>
        `;
        return;
    }

    // Parcourir une par une chaque salle du tableau pour fabriquer sa boîte
    listeEspaces.forEach(espace => {
        const article = document.createElement("article");
        article.classList.add("card-espace-wrapper");

        // Génération dynamique des icônes d'équipements (SVG Lucide)
        const tagsHTML = espace.equipements.map(item => {
            // Préparer une boîte à texte pour y stocker le futur dessin SVG de l'icône
            let svgIcon = "";
            
            // Choisir le dessin des petites ondes si l'équipement s'appelle Fibre
            if (item === "Fibre") {
                svgIcon = `<svg aria-hidden="true" focusable="false" xmlns="http://w3.org" width="15" height="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon-svg lucide lucide-wifi" viewBox="0 0 24 24"><path d="M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.859a10 10 0 0 1 14 0M8.5 16.429a5 5 0 0 1 7 0"/></svg>`;
            // Choisir le dessin du fauteuil roulant si l'équipement s'appelle PMR
            } else if (item === "PMR") {
                svgIcon = `<svg aria-hidden="true" focusable="false" xmlns="http://w3.org" width="15" height="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon-svg lucide lucide-accessibility" viewBox="0 0 24 24"><circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1M5 8l3-3 5.5 3-2.36 3.5M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/></svg>`;
            // Choisir le dessin de la télévision carrée si l'équipement s'appelle 4K
            } else if (item === "4K") {
                svgIcon = `<svg aria-hidden="true" focusable="false" xmlns="http://w3.org" width="15" height="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon-svg lucide lucide-monitor" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`;
            }

            // Renvoyer le code HTML de la petite étiquette avec l'icône et le mot
            return `
                <span class="tag">
                    ${svgIcon}
                    ${item}
                </span>
            `;
        }).join(""); // Recoller tous les morceaux d'étiquettes ensemble pour former un seul texte

        // Injection du template HTML validé W3C & Accessibilité
        // Remplir tout l'intérieur de la carte avec les vraies données de la salle actuelle
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
                    <!-- Lien vers la fiche avec le paramètre d'URL ID (US-05) -->
                    <a href="pages/espace.html?id=${espace.id}" class="card-main-link" title="Consulter la fiche détaillée de l'espace ${espace.nom}">Voir la fiche</a>
                </div>
            </div>
        `;

        // Suspendre officiellement la nouvelle carte construite à l'intérieur de la grille de l'écran
        targetContainer.appendChild(article);
    });

    // Restaurer l'état des cœurs après chaque nouvel affichage ou filtrage.
    mettreAJourBoutonsFavoris(targetContainer, listeEspaces);
}

function filtrerCatalogue(listeComplete, targetContainer, criteres) {
    // Rôle : Faire un tri croisé dans la liste des salles en fonction des choix de l'utilisateur
    // Paramètres : la liste complète (tableau), la grille d'affichage (conteneur DOM) et l'objet contenant les choix (critères)

    // Créer une copie de la liste complète pour pouvoir la vider au fur et à mesure du tri
    let espacesFiltres = listeComplete;

    // Trier les salles par Ville et par Arrondissement si un choix a été fait
    if (criteres.ville !== "") {
        // Filtrer la liste en ne gardant que les lignes qui correspondent à la ville cliquée
        espacesFiltres = espacesFiltres.filter(espace => {
            // Regarder si l'utilisateur cherche précisément le 8ème arrondissement de Paris
            if (criteres.ville === "paris8") return espace.ville === "Paris" && espace.arrondissement === "8e";
            // Regarder si l'utilisateur cherche précisément le 11ème arrondissement de Paris
            if (criteres.ville === "paris11") return espace.ville === "Paris" && espace.arrondissement === "11e";
            // Regarder si l'utilisateur cherche précisément le 2ème arrondissement de Lyon
            if (criteres.ville === "lyon2") return espace.ville === "Lyon" && espace.arrondissement === "2e";
            // Comparer les textes des villes en minuscules pour éviter les pièges de majuscules
            return espace.ville.toLowerCase() === criteres.ville.toLowerCase();
        });
    }

    // Trier les salles pour vérifier qu'elles ont assez de chaises (US-03)
    if (criteres.capacite !== "") {
        // Transformer le texte du choix de capacité en un vrai nombre mathématique entier
        const mincapacite = parseInt(criteres.capacite, 10);
        // Filtrer la liste pour éliminer toutes les pièces trop petites
        espacesFiltres = espacesFiltres.filter(espace => espace.capacite >= mincapacite);
    }

    // Accumuler le tri en vérifiant si la case de la prise Internet Fibre est cochée
    if (criteres.wifi) {
        // Filtrer la liste pour rejeter les salles sans connexion réseau moderne
        espacesFiltres = espacesFiltres.filter(espace => espace.equipements.includes("Fibre"));
    }
    
    // Accumuler le tri en vérifiant si la case de l'accès fauteuil roulant est cochée
    if (criteres.pmr) {
        // Filtrer la liste pour éliminer les locaux non accessibles 
        espacesFiltres = espacesFiltres.filter(espace => espace.equipements.includes("PMR"));
    }
    
    // Accumuler le tri en vérifiant si la case de la télévision ou de l'écran 4K est cochée
    if (criteres.screen) {
        // Filtrer la liste pour ne garder que les salles munies d'un écran haute définition
        espacesFiltres = espacesFiltres.filter(espace => espace.equipements.includes("4K"));
    }

    // Réinjecter immédiatement la grille de l'écran avec la nouvelle liste triée (US-03)
    renderEspaces(espacesFiltres, targetContainer);
}

// Ecouteur d'évènement si le contenu HTML est totalement chargé
document.addEventListener("DOMContentLoaded", () => {
    // Initialiser le catalogue
    initCatalogue();
});
