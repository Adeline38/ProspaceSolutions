/* Charger le JSON puis remplir la fiche demandée dans l’URL. */



/* Fonctions d’aide évitent de répéter le même code plusieurs fois */

function ecrireTexte(selecteur, valeur) {
    // Chercher l’élément qui doit recevoir le texte
    const element = document.querySelector(selecteur);

    // Écrire seulement si l’élément existe
    if (element) {
        element.textContent = valeur;
    }
}

function formaterPrix(prix) {
    // Transformer un nombre en prix français, par exemple « 45 € »
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
    }).format(prix);
}

function creerEtoiles(note) {
    // Arrondir la note pour obtenir le nombre d’étoiles pleines.
    const noteArrondie = Math.round(note);

    // Préparer une chaîne qui recevra les cinq SVG.
    let etoilesHtml = "";

    // Répéter la création d’une étoile cinq fois.
    for (let index = 0; index < 5; index += 1) {
        // Préparer une étoile vide par défaut.
        let remplissage = "none";

        // Remplir l’étoile si sa position est inférieure à la note.
        if (index < noteArrondie) {
            remplissage = "currentColor";
        }

        // Ajouter le SVG de l’étoile à la chaîne HTML.
        etoilesHtml += `
            <svg
                aria-hidden="true"
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                fill="${remplissage}"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="icon-svg lucide lucide-star"
                viewBox="0 0 24 24"
            >
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"/>
            </svg>
        `;
    }

    // Renvoyer les cinq SVG construits.
    return etoilesHtml;
}

function afficherErreurFiche(message) {
    // Remplacer le chargement par une explication simple.
    const zone = document.getElementById("fiche-loading-zone");
    if (!zone) return;

    zone.innerHTML = `<div class="error-message" role="alert"><strong>Erreur de chargement</strong><p>${message}</p><a href="../index.html">Retourner à l’accueil</a></div>`;
}

async function initFicheEspace() {
    // Lire l’identifiant placé après ?id= dans l’URL
    const parametresUrl = new URLSearchParams(window.location.search);

    const espaceId = parametresUrl.get("id");

    // Chercher les deux zones principales de la fiche
    const zoneChargement = document.getElementById("fiche-loading-zone");

    const zoneContenu = document.getElementById(
        "fiche-content-zone"
    );

    // Arrêter le script si la structure HTML est incomplète
    if (!zoneChargement || !zoneContenu) {
        console.error("Les zones de la fiche espace sont introuvables.");
        return;
    }

    // Afficher une aide si aucun identifiant n’est présent
    if (!espaceId) {
        afficherErreurFiche("Aucun espace n’a été demandé.");
        return;
    }

    // Montrer que le téléchargement est en cours
    zoneChargement.innerHTML = `
        <div class="spinner" aria-hidden="true"></div>
        <p>Chargement de la fiche…</p>
    `;

    zoneChargement.setAttribute("aria-busy", "true");

    try {
        // Télécharger le catalogue local.
        const reponse = await fetch(
            "../assets/data/espace.json"
        );

        // Détecter un fichier absent ou inaccessible
        if (!reponse.ok) {
            throw new Error("CHARGEMENT_JSON");
        }

        // Transformer le JSON en tableau JavaScript
        const espaces = await reponse.json();

        // Ensuite
        // Rechercher la salle correspondant à l’identifiant
        const espace = espaces.find(
            item => item.id === espaceId
        );

        // Détecter un identifiant inconnu
        if (!espace) {
            throw new Error("ESPACE_INTROUVABLE");
        }

        // Injecter les informations de la salle sélectionnée
        alimenterDonneesFiche(espace);

        // Activer les actions qui dépendent de cette salle
        gererBoutonFavoris(espace.id, espace.nom);

        // Transmettre l’identifiant et non le nom
        gererRedirectionContact(espace.id);

        // Supprimer le spinner et le message de chargement
        zoneChargement.replaceChildren();

        // Masquer complètement la zone devenue inutile
        zoneChargement.hidden = true;

        // Afficher la fiche seulement lorsqu’elle est prête
        zoneContenu.hidden = false;

    } catch (error) {
        // Garder le détail technique dans la console
        console.error("Impossible de charger la fiche :",error);

        // Préparer une variable qui recevra le message.
        let message;

        // Vérifier la nature de l’erreur.
        if (error.message === "ESPACE_INTROUVABLE") {
            // Expliquer que l’identifiant ne correspond à aucune salle.
            message = "L’espace demandé est introuvable.";
        } else {
            // Expliquer qu’un problème général empêche le chargement.
            message =
                "Impossible de charger les informations pour le moment.";
        }

        // Afficher le message choisi.
        afficherErreurFiche(message);
    } finally {
        // Signaler que le chargement est terminé
        zoneChargement.setAttribute(
            "aria-busy",
            "false"
        );
    }
}

function creerIconeEquipement(equipement) {
    // Choisir un dessin selon le nom de l’équipement.
    const icones = {
        Fibre: '<svg aria-hidden="true" focusable="false" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.86a10 10 0 0 1 14 0M8.5 16.43a5 5 0 0 1 7 0"/></svg>',
        PMR: '<svg aria-hidden="true" focusable="false" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1M5 8l3-3 5.5 3-2.36 3.5"/></svg>',
        "4K": '<svg aria-hidden="true" focusable="false" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg>'
    };
    return icones[equipement] || "";
}

/**/

function alimenterDonneesFiche(espace) {
    // Construire le titre SEO demandé par le cahier des charges.
    document.title =
        `${espace.nom} — Espace de travail ` +
        `${espace.capacite} personnes | ProSpace Solutions`;

    // Mettre à jour la description de la page.
    const metaDescription = document.querySelector(
        'meta[name="description"]'
    );

    if (metaDescription) {
        metaDescription.content =
            `Découvrez ${espace.nom}, ` +
            `${espace.type || "espace de travail"} ` +
            `à ${espace.ville}, pouvant accueillir ` +
            `${espace.capacite} personnes.`;
    }

    // Construire une adresse provisoire si le JSON n’a pas encore d’adresse.
    const adresse =
        espace.adresse
        || `${espace.ville} ${espace.arrondissement || ""}`.trim();

    // Injecter les textes simples.
    ecrireTexte(".dynamic-breadcrumb-city",espace.ville);
    ecrireTexte(".dynamic-breadcrumb-name",espace.nom);
    ecrireTexte(".dynamic-type",espace.type || "Espace de travail");
    ecrireTexte(".dynamic-name",espace.nom);
    ecrireTexte(".dynamic-address",adresse);
    ecrireTexte(".dynamic-note",espace.note.toLocaleString("fr-FR", {minimumFractionDigits: 1}));
    ecrireTexte(".dynamic-avis",`${espace.avis} avis vérifiés`);
    ecrireTexte(".dynamic-description",espace.description);
    ecrireTexte(".dynamic-capacity",espace.capacite);

    // Chercher la zone préparée pour recevoir les étoiles.
    const zoneEtoiles = document.querySelector(".dynamic-stars");

    // Vérifier que la zone existe avant de la modifier.
    if (zoneEtoiles) {
        // Interpréter les chaînes SVG comme des éléments HTML.
        zoneEtoiles.innerHTML = creerEtoiles(espace.note);
    }

    // Donner une description complète de la note aux lecteurs d’écran.
    const zoneNote = document.querySelector(
        ".fiche-rating"
    );

    if (zoneNote) {
        zoneNote.setAttribute(
            "aria-label",
            `Note ${espace.note.toFixed(1)} sur 5, ` +
            `${espace.avis} avis vérifiés`
        );
    }

    // Utiliser les futurs tarifs du JSON ou les calculs actuels.
    const tarifHeure =
        espace.tarifs?.heure
        ?? espace.prix;

    const tarifDemiJournee =
        espace.tarifs?.demiJournee
        ?? espace.prix * 4 - 20;

    const tarifJournee =
        espace.tarifs?.journee
        ?? espace.prix * 8 - 80;

    // Afficher les trois prix au format français.
    ecrireTexte(".price-hour",formaterPrix(tarifHeure));
    ecrireTexte(".price-half",formaterPrix(tarifDemiJournee));
    ecrireTexte(".price-day",formaterPrix(tarifJournee));
    
    // Remplir la galerie sans répéter artificiellement la même photo.
    alimenterGalerie(espace);

    // Construire la liste des équipements.
    alimenterEquipements(espace.equipements);
}

function alimenterGalerie(espace) {
    // Utiliser la nouvelle galerie si elle existe.
    const images = Array.isArray(espace.images)
        ? espace.images
        : [
            {
                // Utiliser seulement l’image principale comme secours.
                src: espace.image,
                alt: `${espace.nom} — vue principale`,
                width: 800,
                height: 520
            }
        ];

    // Parcourir les trois emplacements HTML.
    for (let index = 0; index < 3; index += 1) {
        const image = document.getElementById(
            `gallery-img-${index + 1}`
        );

        const figure = image?.closest(".gallery-item");
        const donneesImage = images[index];

        // Ignorer un emplacement HTML introuvable.
        if (!image || !figure) continue;

        // Masquer l’emplacement si la photographie manque.
        if (!donneesImage) {
            figure.hidden = true;
            continue;
        }

        // Afficher l’emplacement lorsqu’une image existe.
        figure.hidden = false;

        // Adapter le chemin depuis le dossier pages.
        image.src = `../${donneesImage.src}`;

        // Utiliser le texte alternatif préparé dans le JSON.
        image.alt =
            donneesImage.alt
            || `${espace.nom} — photographie ${index + 1}`;

        // Réserver la bonne place avant le chargement.
        image.width = donneesImage.width || 800;
        image.height = donneesImage.height || 520;
    }
}

function alimenterEquipements(equipements = []) {
    // Chercher la liste vide préparée dans le HTML.
    const liste = document.querySelector(
        ".dynamic-equipments-list"
    );

    // Arrêter la fonction si la liste est absente.
    if (!liste) return;

    // Supprimer les anciens équipements.
    liste.replaceChildren();

    // Créer une ligne accessible pour chaque équipement.
    equipements.forEach(equipement => {
        const element = document.createElement("li");

        // Ajouter l’icône décorative déjà créée par ta fonction.
        element.insertAdjacentHTML(
            "afterbegin",
            creerIconeEquipement(equipement)
        );

        // Ajouter le nom avec textContent pour garder un texte sûr.
        const texte = document.createElement("span");
        texte.textContent = equipement;
        element.appendChild(texte);

        // Ajouter la ligne à la liste.
        liste.appendChild(element);
    });
}

/**/

function gererBoutonFavoris(espaceId, nomEspace) {
    // Chercher les éléments utiles au bouton favori.
    const bouton = document.getElementById("btn-toggle-favoris");
    const icone = bouton?.querySelector(".btn-fav-icon");
    const texte = bouton?.querySelector(".btn-fav-text");
    const feedback = document.getElementById("fiche-favorite-feedback");

    // Arrêter la fonction si le bouton est incomplet.
    if (!bouton || !icone || !texte) return;

    function actualiserBouton() {
    // Vérifier si l’espace est présent dans les favoris.
    const favoris = lireFavoris();
    const estFavori = favoris.includes(espaceId);

    // Mettre à jour les éléments communs aux deux situations.
    bouton.setAttribute(
        "aria-pressed",
        String(estFavori)
    );

    bouton.classList.toggle(
        "is-active",
        estFavori
    );

    // Choisir l’apparence correspondant à l’état actuel.
    if (estFavori) {
        // Présenter l’action permettant de retirer le favori.
        bouton.setAttribute(
            "aria-label",
            `Retirer ${nomEspace} de mes favoris`
        );

        // Afficher le cœur plein.
        icone.src =
            "../assets/icons/ico_coeur-plein.svg";

        // Confirmer que l’espace est enregistré.
        texte.textContent =
            "Sauvegardé en favoris";
    } else {
        // Présenter l’action permettant d’ajouter le favori.
        bouton.setAttribute(
            "aria-label",
            `Ajouter ${nomEspace} à mes favoris`
        );

        // Afficher le cœur vide.
        icone.src =
            "../assets/icons/ico_coeur.svg";

        // Proposer l’ajout aux favoris.
        texte.textContent =
            "Ajouter aux favoris";
    }
}

    bouton.addEventListener("click", () => {
        // Lire l’état avant de modifier la liste.
        const favoris = lireFavoris();
        const estDejaFavori = favoris.includes(
            espaceId
        );

        // Préparer la nouvelle liste des favoris.
        let nouvelleListe;

        // Vérifier si l’espace est déjà enregistré.
        if (favoris.includes(espaceId)) {
            // Retirer seulement l’identifiant de l’espace courant.
            nouvelleListe = favoris.filter(
                id => id !== espaceId
            );
        } else {
            // Copier les anciens favoris puis ajouter le nouvel identifiant.
            nouvelleListe = [
                ...favoris,
                espaceId
            ];
        }

        // Arrêter l’action si le stockage échoue.
        if (!enregistrerFavoris(nouvelleListe)) {
            if (feedback) {
                feedback.textContent =
                    "Impossible de modifier les favoris.";
            }

            return;
        }

        // Mettre à jour le bouton et la pastille du menu.
        actualiserBouton();
        mettreAJourCompteurFavoris(nouvelleListe);

        // Annoncer le résultat sans recharger la page.
        if (feedback) {
            feedback.textContent = estDejaFavori
                ? `${nomEspace} a été retiré des favoris.`
                : `${nomEspace} a été ajouté aux favoris.`;
        }
    });

    // Synchroniser la fiche si un autre onglet change les favoris.
    window.addEventListener("storage", event => {
        if (event.key === FAVORIS_STORAGE_KEY) {
            actualiserBouton();
        }
    });

    // Afficher le bon état dès l’ouverture de la fiche.
    actualiserBouton();
}

function gererRedirectionContact(espaceId) {
    // Chercher le vrai lien placé dans l’encart.
    const lienContact = document.getElementById("btn-contact-team");

    // Arrêter la fonction si le lien est absent.
    if (!lienContact) return;

    // Transmettre l’identifiant stable de la salle.
    lienContact.href =`contact.html?espace=${encodeURIComponent(espaceId)}`;}

// Lancer le chargement lorsque le document est prêt
document.addEventListener("DOMContentLoaded", initFicheEspace);
