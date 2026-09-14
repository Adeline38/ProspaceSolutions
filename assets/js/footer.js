/* ================================================= 

Rôle : Afficher dynamiquement le footer

/* ================================================= 

- calculerPrefixeCheminFooter() : Calculer le bon chemin vers la racine du site selon la page actuelle
- integrerFooterDynamique() : Créer et injecter le pied de page (footer) avec les bons liens

*/

function calculerPrefixeCheminFooter() {
    // Rôle : Calculer le bon chemin vers la racine du site selon la page actuelle
    // Paramètres : Le préfixe à ajouter devant les liens ("./" ou "../")

    // Récupérer le nom de l'adresse internet de la page actuelle
    const cheminActuel = window.location.pathname;

    // Vérifier si l'adresse contient le sous-dossier "pages/"
    if (cheminActuel.includes("pages/")) {
        return "../"; // Reculer d'un dossier (cas des pages intérieures)
    } else {
        return "./";  // Rester au même niveau (cas de l'index.html)
    }
}

/**
 * Rôle : Créer et injecter le pied de page (footer) avec les bons liens
 */
function integrerFooterDynamique() {
    // Chercher la balise <footer> de la page HTML
    const footerBalise = document.querySelector("footer");

    // Sécurité : Vérifier que la balise existe bien avant de travailler
    if (footerBalise) {
        // Récupérer le préfixe magique ("./" ou "../")
        const prefixe = calculerPrefixeCheminFooter();

        // Injecter le code HTML sémantique avec la variable ${prefixe} devant les liens pour éviter les liens brisés
        footerBalise.innerHTML = `
            <div class="footer__container">

                <!-- === A PROPOS et logo === -->

                <section class="footer__wrapper footer-about">
                        
                    <h2 class="sr-only">Liens de bas de page</h2>

                    <div>

                        <div class="logo">

                            <a class="logo prospace-solutions" href="${prefixe}index.html" title="Retour à la page d'Accueil de Prospace Solutions" aria-label="Retour à la page d'Accueil de Prospace Solutions">

                                <svg aria-hidden="true" focusable="false" class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="32" height="32" aria-labelledby="logo-title" viewBox="0 0 32 32">
                                    <title>Logo ProSpace Solutions</title>
                                    <rect width="32" height="32" fill="#0284c7" rx="8"/>
                                    <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                        <path stroke-width="1.41666" d="M11.75 23.083v-12.75a1.417 1.417 0 0 1 1.417-1.416h5.666a1.417 1.417 0 0 1 1.417 1.416v12.75ZM11.75 16h-1.417a1.417 1.417 0 0 0-1.416 1.417v4.25a1.417 1.417 0 0 0 1.416 1.416h1.417M20.25 13.875h1.417a1.417 1.417 0 0 1 1.416 1.417v6.375a1.417 1.417 0 0 1-1.416 1.416H20.25M14.583 11.75h2.834M14.583 14.583h2.834M14.583 17.417h2.834M14.583 20.25h2.834"/>
                                    </g>
                                </svg>

                                <span>
                                    Prospace <span>Solutions</span>
                                </span>

                            </a>

                        </div>

                        <p class="footer-text">
                            Des solutions d'espaces de travail flexibles et adaptées à vos besoins professionnels partout en France.
                        </p>

                        <a href="${prefixe}pages/contact.html" class="btn-footer" title="Nous contacter" aria-label="Nous contacter">

                            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon-svg lucide lucide-mail" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>

                            <span>Nous contacter</span>

                        </a>
                    
                    </div>

                    <!-- === DESTINATIONS espaces === -->
                    
                    <nav class="footer-column" aria-labelledby="footer-title-destinations">

                        <h3 id="footer-title-destinations" class="footer-title">Destinations</h3>

                        <ul class="footer-links">
                            <li>
                                <a href="#" title="Découvrir les espaces disponibles à Paris" aria-label="Espaces à Paris">Espaces à Paris</a>
                            </li>

                            <li>
                                <a href="#" title="Découvrir les espaces disponibles à Lyon" aria-label="Espaces à Lyon">Espaces à Lyon</a>
                            </li>

                            <li>
                                <a href="#" title="Découvrir les espaces disponibles à Bordeaux" aria-label="Espaces à Bordeaux">Espaces à Bordeaux</a>
                            </li>

                            <li>
                                <a href="#" title="Découvrir les espaces disponibles à Nantes" aria-label="Espaces à Nantes">Espaces à Nantes</a>
                            </li>

                            <li>
                                <a href="#" title="Découvrir les espaces disponibles à Marseille" aria-label="Espaces à Marseille">Espaces à Marseille</a>
                            </li>

                            <li>
                                <a href="#" title="Découvrir les espaces disponibles à Toulouse" aria-label="Espaces à Toulouse">Espaces à Toulouse</a>
                            </li>

                            <li>
                                <a href="#" title="Découvrir les espaces disponibles à Lille" aria-label="Espaces à Lille">Espaces à Lille</a>
                            </li>
                        </ul>

                    </nav>

                    <!-- === SERVICES espaces === -->

                    <nav class="footer-column" aria-labelledby="footer-title-services">

                        <h3 id="footer-title-services" class="footer-title">Services</h3>

                        <ul class="footer-links">

                            <li>
                                <a href="#" title="Découvrir nos locations de salles de réunion" aria-label="Salles de réunion">Salles de réunion</a>
                            </li>

                            <li>
                                <a href="#" title="Découvrir nos espaces de coworking" aria-label="Espaces de coworking">Espaces de coworking</a>
                            </li>

                            <li>
                                <a href="#" title="Découvrir nos locations de salles de formation" aria-label="Salles de formation">Salles de formation</a>
                            </li>

                            <li>
                                <a href="#" title="Découvrir nos locations de bureaux privatifs" aria-label="Bureaux privatifs">Bureaux privatifs</a>
                            </li>

                            <li>
                                <a href="#" title="Découvrir nos studios de visioconférence" aria-label="Studios visio">Studios visio</a>
                            </li>

                            <li>
                                <a href="#" title="Découvrir nos espaces événementiels" aria-label="Espaces événementiels">Espaces événementiels</a>
                            </li>

                        </ul>

                    </nav>

                    <!-- === LEGAL & ACCES  === -->

                    <nav class="footer-column" aria-labelledby="footer-title-legal">

                        <h3 id="footer-title-legal" class="footer-title">Légal &amp; accès</h3>

                        <ul class="footer-links">

                            <li>
                                <a href="#" title="Consulter les mentions légales du site" aria-label="Mentions légales">Mentions légales</a>
                            </li>

                            <li>
                                <a href="#" title="Consulter les conditions générales d'utilisation et de vente" aria-label="CGU et CGV">CGU &amp; CGV</a>
                            </li>

                            <li>
                                <a href="#" title="Consulter la politique de confidentialité" aria-label="Politique de confidentialité">Politique de confidentialité</a>
                            </li>

                            <li>
                                <a href="#" title="Prendre connaissance de la gestion des cookies" aria-label="Gestion des cookies">Gestion des cookies</a>
                            </li>

                            <li>
                                <a href="#" title="Consulter la déclaration d'accessibilité du site" aria-label="Déclaration d'accessibilité">Déclaration d'accessibilité</a>
                            </li>

                            <li>
                                <a href="#" title="Consulter le plan du site" aria-label="Sitemap">Sitemap</a>
                            </li>
                            
                        </ul>

                    </nav>

                </section>

                <section class="footer__bottom">
                        
                    <h2 class="sr-only">Onfos complémentaires</h2>

                    <p>© 2025 ProSpace Solutions SAS — Tous droits réservés</p>
                    <p>
                        Conformité RGAA 4.1 · <span>Accessibilité : partiellement conforme</span>
                    </p>

                </section>

            </div>
        `;
    }
}

// 6. Écouter le navigateur : lancer la création dès que le HTML de base est dessiné
document.addEventListener("DOMContentLoaded", integrerFooterDynamique);
