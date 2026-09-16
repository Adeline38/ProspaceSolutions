FONCTIONNEMENT LOGIQUE 
pseudo-code en français

# ACCUEIL main.js
# initCatalogue
• Attendre que la page soit affichée (asyn)
• Activer le cercle de chargement
• Demander la liste des espaces au classeur de données (JSON)
• Si la liste arrive
    éteindre le cercle de chargement, 
    afficher toutes les cartes, 
    écouter les changements sur les menus de filtrage
• Sinon (une panne survient)
    éteindre le cercle
    afficher un message de panne

# renderEspaces
• Vider la grille d'affichage de la page
• Si la liste triée est vide
    afficher le texte "Aucun espace ne correspond"
• Pour chaque espace de la liste
    fabriquer une carte avec 
        son nom
        sa ville
        sa note
        sa photo
        son prix
        ses petites icônes d'options
        un bouton cliquable contenant son numéro d'identité secret

# filtrerCatalogue
• Prendre la liste complète des espaces
• Regarder les choix actuels de l'utilisateur (villes cochées, nombre de places, options voulues)
• Trier la liste pour ne garder que les lignes qui correspondent à tous les choix en même temps
• Envoyer cette liste triée à la fonction d'affichage

# mettre en favoris depuis l'accueil
• Lire la liste "prospace_favoris" enregistrée dans le navigateur
• Après l'affichage des cartes, colorer les cœurs des espaces déjà enregistrés
• Quand l'utilisateur clique sur un cœur
    si l'espace est absent de la liste, ajouter son identifiant
    sinon, retirer son identifiant
• Enregistrer la nouvelle liste dans localStorage
• Mettre à jour le cœur et son texte accessible
• Demander à la fonction commune du header de mettre à jour le compteur du menu
• Garder le même fonctionnement après l'utilisation des filtres


# ESPACES espace.js
# initFicheEspace
• Attendre que la page soit affichée
• Regarder dans l'adresse de la page pour lire le numéro d'identité secret de l'espace demandé
    Si aucun numéro n'est écrit
        afficher un message d'erreur
• Activer le spinner de chargement
• Demander les fiches au classeur de données
• Chercher la fiche qui possède le bon numéro d'identité
• Si elle est trouvée
    éteindre le spinner de chargement
    remplir la page avec les informations
    activer la gestion du bouton de sauvegarde
    activer la gestion du bouton de contact
• Sinon elle n'existe pas ou en cas de panne
    afficher un texte d'erreur avec un lien de retour 

# alimenterDonneesFiche
• Écrire le nom et la ville de la salle dans la barre de navigation du haut
• Changer le nom de l'onglet du navigateur pour que Google l'enregistre avec le nom et la capacité de la salle
• Remplir la page avec 
    la description
    la note
    la vraie adresse
    les photos de la galerie
• Calculer automatiquement 
    le prix réduit pour une demi-journée
    le prix pour une journée entière
• Regarder les équipements de la salle
• Dessiner la liste des options avec les bonnes icônes
