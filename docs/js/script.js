/**
 * =========================================================
 * CORE SCRIPT - JARDINS DU CŒUR
 * Gère l'interface, les calculs agronomiques et l'Oracle IA
 * =========================================================
 */

let gardenDB = null;

// 1. CHARGEMENT DE LA BASE DE DONNÉES
async function loadDatabase() {
    try {
        const response = await fetch('../database.json');
        gardenDB = await response.json();
        console.log("🌱 Base de données synchronisée");

        // ANALYSE TECHNIQUE (Calculs lignes de 10m)
        analyserCulturesActives();

        // MISE À JOUR UI (Uniquement si on est sur une page de suivi)
        if (document.querySelector('.c-plant-header')) {
            const premierLegume = gardenDB.cultures_en_cours[0].id_plante;
            updatePlantUI(premierLegume);
        }
    } catch (e) {
        console.error("Erreur chargement database.json :", e);
    }
}

// 2. MOTEUR AGRONOMIQUE (Calculs 10m)
function calculerQuantitePlants(longueurCm, espacementCm) {
    if (!longueurCm || !espacementCm) return 0;
    return Math.floor(longueurCm / espacementCm);
}

function updatePlantUI(idPlante) {
    if (!gardenDB) return;

    const fiche = gardenDB.fiche_technique_plantes;
    const p = Object.values(fiche).find(item => item.id_plante === idPlante);
    const culture = gardenDB.cultures_en_cours.find(c => c.id_plante === idPlante);

    if (!p) return;

    // --- SÉCURITÉ : On vérifie que les éléments existent avant de les modifier ---
    const elTitle = document.querySelector('.c-plant-header h2');
    const elSub = document.querySelector('.c-plant-header p');
    const metrics = document.querySelectorAll('.c-metric-card');
    const voiceBtn = document.querySelector('.c-btn-action');

    if (elTitle) elTitle.innerText = p.nom_commun;
    if (elSub) {
        let txt = `Famille : ${p.famille_botanique} | ID : ${p.id_plante}`;
        if (culture) txt += ` | Installé le 07/05/2026`;
        elSub.innerText = txt;
    }

    if (metrics.length >= 2) {
        const longueur = culture ? culture.dimensions_cm.longueur : 1000;
        const quantite = calculerQuantitePlants(longueur, p.parametres_plantation.distance_inter_plants_cm);
        
        metrics[0].innerHTML = `<strong>Population :</strong><br>${quantite} plants sur 10m`;
        metrics[1].innerHTML = `<strong>Espacement :</strong><br>Tous les ${p.parametres_plantation.distance_inter_plants_cm}cm`;
    }

    if (voiceBtn) {
        voiceBtn.onclick = () => parlerPlante(p.id_plante);
    }
}

function analyserCulturesActives() {
    if (!gardenDB) return;
    console.log("--- 📊 ANALYSE DES LIGNES DE 10M ---");
    gardenDB.cultures_en_cours.forEach(c => {
        const p = Object.values(gardenDB.fiche_technique_plantes).find(f => f.id_plante === c.id_plante);
        if (p) {
            const q = calculerQuantitePlants(c.dimensions_cm.longueur, p.parametres_plantation.distance_inter_plants_cm);
            console.log(`✅ ${p.nom_commun} : ~${q} plants prévus.`);
        }
    });
}

// 3. L'ORACLE (IA - TEXTE PUR)
async function parlerPlante(idPlanteJSON) {
    let nomPlante = idPlanteJSON;
    if (gardenDB) {
        const info = Object.values(gardenDB.fiche_technique_plantes).find(p => p.id_plante === idPlanteJSON);
        if (info) nomPlante = info.nom_commun;
    }

    const modalBody = document.getElementById('modal-body');
    if (modalBody) modalBody.innerText = "L'Oracle analyse la terre...";

    try {
        const response = await fetch('/api/plant-voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomPlante: nomPlante, etatSol: "frais" })
        });
        
        const data = await response.json();
        if (modalBody) {
            modalBody.innerHTML = `<div style="padding:15px; background:#f0f7f0; border-radius:8px; border-left:4px solid var(--color-primary);">
                <strong>🌿 ${nomPlante} :</strong><br>"${data.texte_parle}"
            </div>`;
        }
    } catch (error) {
        console.error("Erreur IA :", error);
    }
}

// 4. HERO SLIDER (Accueil)
let currentSlide = 0;
function moveSlide(direction) {
    const slides = document.querySelectorAll('.c-slide');
    if (slides.length === 0) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

// 5. INITIALISATION GÉNÉRALE
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();
    
    // Auto-play slider si présent
    if (document.querySelector('.c-slide')) {
        setInterval(() => moveSlide(1), 5000);
    }
});