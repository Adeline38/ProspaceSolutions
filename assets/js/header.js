/* Partager le menu et les outils communs des favoris sur toutes les pages. */

const FAVORIS_STORAGE_KEY = "prospace_favoris";

function lireFavoris() {
    // Lire et nettoyer la liste enregistrée dans le navigateur.
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

function enregistrerFavoris(favoris) {
    // Sauvegarder une liste propre et signaler un éventuel échec.
    try {
        localStorage.setItem(FAVORIS_STORAGE_KEY, JSON.stringify([...new Set(favoris)]));
        return true;
    } catch (error) {
        console.error("Impossible d’enregistrer les favoris ProSpace :", error);
        return false;
    }
}

function mettreAJourCompteurFavoris(favoris = lireFavoris()) {
    // Afficher le nombre de favoris dans la pastille du menu.
    const lienMesEspaces = document.querySelector(
        '.navigation a[href*="mes-espaces"]'
    );
    const pastille = lienMesEspaces?.querySelector("span");

    if (!pastille) return;

    const nombreFavoris = favoris.length;
    const libelleFavoris = nombreFavoris > 1
        ? `${nombreFavoris} espaces favoris`
        : `${nombreFavoris} espace favori`;

    pastille.textContent = nombreFavoris;
    pastille.setAttribute("aria-hidden", "true");
    lienMesEspaces.setAttribute(
        "aria-label",
        `Aller à la page Mes espaces, ${libelleFavoris}`
    );
}

function calculerPrefixeChemin() {
    // Adapter les liens selon la profondeur de la page.

    const cheminActuel = window.location.pathname;

    if (cheminActuel.includes("pages/")) {
        return "../"; // Revenir en arrière d'un dossier
    } else {
        return "./";  // Rester au même niveau (cas de l'index.html)
    }
}

function integrerHeaderDynamique() {
    // Construire le même menu sur chaque page.

    const headerBalise = document.querySelector("header");
    
    if (headerBalise) {

        const prefixe = calculerPrefixeChemin();

        headerBalise.innerHTML = `
            <div class="header__container">
                
                <div class="logo">

                    <a class="logo prospace-solutions" href="${prefixe}index.html" title="Retour à la page d'Accueil de Prospace Solutions" aria-label="Retour à la page d'Accueil de Prospace Solutions">

                        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="32" height="32" aria-labelledby="logo-title" viewBox="0 0 32 32">
                            <title>Logo ProSpace Solutions</title>
                            <rect width="32" height="32" fill="#0284c7" rx="8"/>
                            <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                <path stroke-width="1.41666" d="M11.75 23.083v-12.75a1.417 1.417 0 0 1 1.417-1.416h5.666a1.417 1.417 0 0 1 1.417 1.416v12.75ZM11.75 16h-1.417a1.417 1.417 0 0 0-1.416 1.417v4.25a1.417 1.417 0 0 0 1.416 1.416h1.417M20.25 13.875h1.417a1.417 1.417 0 0 1 1.416 1.417v6.375a1.417 1.417 0 0 1-1.416 1.416H20.25M14.583 11.75h2.834M14.583 14.583h2.834M14.583 17.417h2.834M14.583 20.25h2.834"/>
                            </g>
                        </svg>

                        <span>Prospace 
                            <span>Solutions</span>
                        </span>

                    </a>

                </div>
                
                <nav class="navigation" aria-label="Menu principal">
                    
                    <ul>                        
                        <li>                            
                            <a class="active" href="${prefixe}index.html" title="Aller à la page Accueil" aria-label="Aller à la page Accueil">Accueil</a>
                        </li>
                        
                        <li>                            
                            <a href="${prefixe}pages/mes-espaces.html" title="Aller à la page Mes espaces" aria-label="Aller à la page Mes espaces">Mes espaces <span></span></a>
                        </li>
                        
                        <li>                            
                            <a href="${prefixe}pages/contact.html" title="Aller à la page Contact" aria-label="Aller à la page Contact">Contact</a>                        
                        </li>
                    </ul>

                </nav>

            </div>
        `;

        mettreAJourCompteurFavoris();
    }
}

// Injecter le menu lorsque le document est prêt.
document.addEventListener("DOMContentLoaded", integrerHeaderDynamique);

window.addEventListener("storage", event => {
    if (event.key === FAVORIS_STORAGE_KEY) {
        mettreAJourCompteurFavoris();
    }
});
