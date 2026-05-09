/**
 * chronologie.js - Moteur de synchronisation temporelle
 */

async function initChronologie() {
    try {
        // Chargement des deux sources de données
        const [resChrono, resGarden] = await Promise.all([
            fetch('../chronologie.json'),
            fetch('../database.json')
        ]);
        
        const chronoData = await resChrono.json();
        const gardenData = await resGarden.json();

        renderTimelineUI(chronoData.historique);
        
        // On informe le moteur 3D de dessiner les lignes si on est sur la bonne page
        if (typeof dessinerPlanchesActives === 'function') {
            dessinerPlanchesActives(gardenData);
        }
    } catch (e) {
        console.error("Erreur de synchronisation temporelle :", e);
    }
}

function renderTimelineUI(events) {
    const container = document.getElementById('timeline-list');
    if (!container) return;

    container.innerHTML = events.reverse().map(event => `
        <div class="c-timeline-entry" onclick="focusOnEvent('${event.type}')">
            <span class="c-entry-date">${new Date(event.date).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}</span>
            <div class="c-entry-content">
                <strong>${event.titre}</strong>
                <p>${event.desc}</p>
            </div>
        </div>
    `).join('');
}

function focusOnEvent(type) {
    console.log(`🔍 Focus sur l'événement : ${type}`);
    // Ici on peut ajouter des filtres de caméra 3D selon l'événement
}

document.addEventListener('DOMContentLoaded', initChronologie);