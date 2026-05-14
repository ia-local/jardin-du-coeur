/**
 * sync-gallery.js - Chargement dynamique de la galerie
 */
async function loadDynamicGallery() {
    const root = document.getElementById('gallery-root');
    try {
        // On tape directement sur le fichier JSON statique
        const response = await fetch('../json/gallery.json'); 
        const images = await response.json();

        root.innerHTML = images.map(img => `
            <div class="c-photo-card" onclick="openFullView('${img.url}')">
                <div class="c-photo-img-container">
                    <img src="${img.url}" alt="${img.name}" class="c-photo-img">
                </div>
                <div class="c-photo-caption">
                    <strong>${img.name}</strong>
                    <span class="c-photo-date">${img.date}</span>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error("Erreur GitHub Pages : Impossible de charger le JSON", e);
    }
}

document.addEventListener('DOMContentLoaded', loadDynamicGallery);