/* ================================================= 

Rôle : Afficher dynamiquement le header

/* ================================================= 

- calculerPrefixeChemin() : Calculer le bon chemin vers la racine du site selon la page actuelle
- integrerHeaderDynamique() : Injecter le Header avec les bons liens calculés dynamiquement

*/

function calculerPrefixeChemin() {
    // Rôle : Calculer le bon chemin vers la racine du site selon la page actuelle
    // Paramètres : Le préfixe à ajouter devant les liens ("./" ou "../")

    // Récupérer le nom ou le chemin de la page actuelle dans le navigateur
    const cheminActuel = window.location.pathname;

    // Vérifier si l'utilisateur se trouve dans le sous-dossier "pages"
    // Si l'adresse contient le mot "pages/", nous sommes sur une page intérieure
    if (cheminActuel.includes("pages/")) {
        return "../"; // Revenir en arrière d'un dossier
    } else {
        return "./";  // Rester au même niveau (cas de l'index.html)
    }
}

function integrerHeaderDynamique() {
    // Rôle : Injecter le Header avec les bons liens calculés dynamiquement

    const headerBalise = document.querySelector("header");
    
    if (headerBalise) {
        // Récupérer le préfixe magique calculé par notre fonction
        const prefixe = calculerPrefixeChemin();

        // Injecter le code HTML sémantique avec la variable ${prefixe} devant les liens pour éviter les liens brisés
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
    }
}

// Lancer l'injection dès que la structure HTML de base est prête
document.addEventListener("DOMContentLoaded", integrerHeaderDynamique);
