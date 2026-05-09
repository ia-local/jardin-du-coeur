/**
 * =========================================================
 * CORE SCRIPT - JARDINS DU CŒUR
 * Gère l'interface, les calculs agronomiques et l'IA (Groq)
 * =========================================================
 */

// ---------------------------------------------------------
// 1. MOTEUR AGRONOMIQUE : Calculs et Base de Données
// ---------------------------------------------------------

// Variable globale pour stocker la base de données une fois chargée
// Variable globale
let gardenDB = null;

async function loadDatabase() {
    try {
        const response = await fetch('../database.json');
        gardenDB = await response.json();
        console.log("🌱 DB prête");
        
        // AU CHARGEMENT : On détecte quelle plante afficher par défaut
        // (Par exemple, si on est sur la fiche-plante.html)
        const premierLégume = gardenDB.cultures_en_cours[0].id_plante;
        updatePlantUI(premierLégume);
        
    } catch (e) { console.error("Erreur synchro JSON", e); }
}

// FONCTION CLÉ : Met à jour l'interface HTML pour une plante donnée
function updatePlantUI(idPlante) {
    if (!gardenDB) return;

    // 1. Récupérer les infos
    const fiche = gardenDB.fiche_technique_plantes;
    // On trouve la fiche via l'ID (ex: PLT-RAD-03) ou le nom
    const p = Object.values(fiche).find(item => item.id_plante === idPlante);
    const culture = gardenDB.cultures_en_cours.find(c => c.id_plante === idPlante);

    if (!p) return;

    // 2. Injecter dans le HTML (Synchronisation forcée)
    document.querySelector('.c-plant-header h2').innerText = p.nom_commun;
    document.querySelector('.c-plant-header p').innerText = `Famille : ${p.famille_botanique} | ID : ${p.id_plante}`;
    
    // Calcul mathématique des plants sur la ligne
    const longueur = culture ? culture.dimensions_cm.longueur : 1000;
    const quantite = Math.floor(longueur / p.parametres_plantation.distance_inter_plants_cm);
    
    // Mise à jour des cartes de métriques
    const metrics = document.querySelectorAll('.c-metric-card');
    metrics[0].innerHTML = `<strong>Quantité estimée :</strong><br>~${quantite} plants`;
    metrics[1].innerHTML = `<strong>Densité :</strong><br>${p.parametres_plantation.distance_inter_plants_cm}cm entre plants`;
    
    if(culture) {
        document.querySelector('.c-plant-header p').innerHTML += `<br>Installé le ${new Date(culture.date_plantation).toLocaleDateString('fr-FR')}`;
    }

    // Mise à jour du bouton vocal pour qu'il parle de LA bonne plante
    const voiceBtn = document.querySelector('.c-btn-action');
    if(voiceBtn) {
        voiceBtn.setAttribute('onclick', `parlerPlante('${p.id_plante}')`);
    }
}
// Fonction pour charger le fichier JSON
async function loadDatabase() {
    try {
        // En fonction de votre serveur, le chemin peut être '/database.json'
        const response = await fetch('../database.json'); 
        gardenDB = await response.json();
        console.log("🌱 Base de données chargée avec succès :", gardenDB);
        
        // Une fois chargée, on lance les calculs
        analyserCulturesActives();
    } catch (error) {
        console.error("Erreur lors du chargement de database.json :", error);
    }
}

// Fonction mathématique : Calcul du nombre de plants sur une ligne
function calculerQuantitePlants(longueurCm, distanceInterPlantsCm) {
    if (!longueurCm || !distanceInterPlantsCm) return 0;
    // On divise la longueur totale de la planche par l'espacement requis
    return Math.floor(longueurCm / distanceInterPlantsCm);
}

// Fonction temporelle : Calcul de la date de récolte
function calculerDateRecolte(datePlantationStr, joursAvantMaturite) {
    const date = new Date(datePlantationStr);
    date.setDate(date.getDate() + joursAvantMaturite);
    // Formatage de la date en français (ex: 27/05/2026)
    return date.toLocaleDateString('fr-FR');
}

// Fonction principale qui croise les planches avec les fiches techniques
function analyserCulturesActives() {
    if (!gardenDB) return;

    const cultures = gardenDB.cultures_en_cours;
    const fiches = gardenDB.fiche_technique_plantes;

    console.log("--- 📊 ANALYSE DES CULTURES EN COURS ---");

    cultures.forEach(culture => {
        // Trouver la fiche technique correspondante (ex: cherche le radis via PLT-RAD-03)
        const planteInfo = Object.values(fiches).find(p => p.id_plante === culture.id_plante);
        
        if (planteInfo) {
            // 1. Calcul de la quantité de plants (Mathématiques)
            const quantite = calculerQuantitePlants(
                culture.dimensions_cm.longueur, 
                planteInfo.parametres_plantation.distance_inter_plants_cm
            );

            // 2. Calcul de la date de récolte (Temporel)
            const dateRecolte = calculerDateRecolte(
                culture.date_plantation, 
                planteInfo.rendement_et_recolte.jours_avant_maturite
            );

            // 3. Affichage dans la console (pour vous en tant que développeur)
            console.log(`✅ Parcelle ${culture.id_parcelle} :`);
            console.log(`   - Légume : ${planteInfo.nom_commun}`);
            console.log(`   - Quantité estimée : ~${quantite} plants sur ${culture.dimensions_cm.longueur / 100} mètres.`);
            console.log(`   - Planté le : ${new Date(culture.date_plantation).toLocaleDateString('fr-FR')}`);
            console.log(`   - Récolte prévue vers le : ${dateRecolte}`);
            
            // NOTE : Ici, nous pourrons cibler les IDs de vos pages HTML pour mettre à jour 
            // le tableau de bord automatiquement (ex: document.getElementById('alerte-recolte').innerText = ...)
        }
    });
}


// ---------------------------------------------------------
// 2. IA ET SYNTHÈSE VOCALE (GROQ SDK & Web Speech API)
// ---------------------------------------------------------

// Demander un conseil agronomique à l'Oracle
async function demanderConseil(texte) {
    try {
        const response = await fetch('/api/oracle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: texte })
        });
        const data = await response.json();
        console.log("🔮 Oracle :", data.reponse);
        // On pourrait l'afficher dans une modale de chat ici
    } catch (error) {
        console.error("Erreur de communication avec l'Oracle:", error);
    }
}


async function loadDatabase() {
    try {
        const response = await fetch('../database.json');
        gardenDB = await response.json();
        console.log("🌱 DB prête");
        
        // AU CHARGEMENT : On détecte quelle plante afficher par défaut
        // (Par exemple, si on est sur la fiche-plante.html)
        const premierLégume = gardenDB.cultures_en_cours[0].id_plante;
        updatePlantUI(premierLégume);
        
    } catch (e) { console.error("Erreur synchro JSON", e); }
}

// FONCTION CLÉ : Met à jour l'interface HTML pour une plante donnée
function updatePlantUI(idPlante) {
    if (!gardenDB) return;

    // 1. Récupérer les infos
    const fiche = gardenDB.fiche_technique_plantes;
    // On trouve la fiche via l'ID (ex: PLT-RAD-03) ou le nom
    const p = Object.values(fiche).find(item => item.id_plante === idPlante);
    const culture = gardenDB.cultures_en_cours.find(c => c.id_plante === idPlante);

    if (!p) return;

    // 2. Injecter dans le HTML (Synchronisation forcée)
    document.querySelector('.c-plant-header h2').innerText = p.nom_commun;
    document.querySelector('.c-plant-header p').innerText = `Famille : ${p.famille_botanique} | ID : ${p.id_plante}`;
    
    // Calcul mathématique des plants sur la ligne
    const longueur = culture ? culture.dimensions_cm.longueur : 1000;
    const quantite = Math.floor(longueur / p.parametres_plantation.distance_inter_plants_cm);
    
    // Mise à jour des cartes de métriques
    const metrics = document.querySelectorAll('.c-metric-card');
    metrics[0].innerHTML = `<strong>Quantité estimée :</strong><br>~${quantite} plants`;
    metrics[1].innerHTML = `<strong>Densité :</strong><br>${p.parametres_plantation.distance_inter_plants_cm}cm entre plants`;
    
    if(culture) {
        document.querySelector('.c-plant-header p').innerHTML += `<br>Installé le ${new Date(culture.date_plantation).toLocaleDateString('fr-FR')}`;
    }

    // Mise à jour du bouton vocal pour qu'il parle de LA bonne plante
    const voiceBtn = document.querySelector('.c-btn-action');
    if(voiceBtn) {
        voiceBtn.setAttribute('onclick', `parlerPlante('${p.id_plante}')`);
    }
}
// Donner la voix à une plante (Roleplay IA)
async function parlerPlante(idPlanteJSON) {
    // Si la DB est chargée, on extrait le nom pour l'IA
    let nomPlante = idPlanteJSON;
    if (gardenDB) {
        const planteInfo = Object.values(gardenDB.fiche_technique_plantes).find(p => p.id_plante === idPlanteJSON);
        if (planteInfo) nomPlante = planteInfo.nom_commun;
    }

    try {
        // 1. Appel au End-Point (Génération du texte par Groq Llama 3.1)
        const response = await fetch('/api/plant-voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomPlante: nomPlante, etatSol: "un peu sec" }) // Le sol peut être dynamisé plus tard
        });
        
        const data = await response.json();
        const textePlante = data.texte_parle;
        
        // 2. Affichage visuel dans la modale (si la modale est ouverte)
        const modalBody = document.getElementById('modal-body');
        if (modalBody) {
            modalBody.innerText = `🌿 "${textePlante}"`;
        }

        // 3. Synthèse vocale native
        if ('speechSynthesis' in window) {
            // Coupe la voix précédente si elle parlait encore
            window.speechSynthesis.cancel(); 
            
            const voix = new SpeechSynthesisUtterance(textePlante);
            voix.lang = 'fr-FR'; // Voix française
            
            // Personnalisation de la voix selon la plante (Optionnel mais fun)
            if (nomPlante.includes("Radis")) {
                voix.pitch = 1.5; // Voix aiguë et rapide pour le radis pressé
                voix.rate = 1.2;
            } else if (nomPlante.includes("Panais")) {
                voix.pitch = 0.5; // Voix grave et lente pour le vieux panais
                voix.rate = 0.8;
            } else {
                voix.pitch = 1.2;    
                voix.rate = 0.9;     
            }

            window.speechSynthesis.speak(voix);
        } else {
            console.warn("La synthèse vocale n'est pas supportée par ce navigateur.");
        }
    } catch (error) {
        console.error("Erreur lors de la génération vocale:", error);
    }
}

let currentSlide = 0;

function moveSlide(direction) {
    const slides = document.querySelectorAll('.c-slide');
    if (slides.length === 0) return;

    // Masquer la slide actuelle
    slides[currentSlide].classList.remove('active');

    // Calculer le nouvel index
    currentSlide = (currentSlide + direction + slides.length) % slides.length;

    // Afficher la nouvelle slide
    slides[currentSlide].classList.add('active');
}

// Auto-play (toutes les 5 secondes)
setInterval(() => {
    moveSlide(1);
}, 5000);
// ---------------------------------------------------------
// 3. INITIALISATION (Au chargement de la page)
// ---------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Charge la base de données dès que la page s'ouvre
    loadDatabase();
    
    // Vous pouvez initialiser d'autres écouteurs d'événements ici
    // (ex: boutons de fermeture de modales, gestion de la pagination...)
});