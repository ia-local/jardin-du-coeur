// Exemple d'appel depuis votre interface (script.js)
async function demanderConseil(texte) {
    const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: texte })
    });
    const data = await response.json();
    console.log(data.reponse);
}
// Fonction pour interroger Groq et lire le texte à voix haute
async function parlerPlante(nomPlante) {
    // 1. Appel au End-Point
    const response = await fetch('/api/plant-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomPlante: nomPlante, etatSol: "un peu sec" }) // À lier dynamiquement
    });
    
    const data = await response.json();
    const textePlante = data.texte_parle;
    
    // 2. Affichage visuel dans la modale
    document.getElementById('modal-body').innerText = `🌿 "${textePlante}"`;

    // 3. Synthèse vocale (Web Speech API native, pas besoin de librairie externe)
    if ('speechSynthesis' in window) {
        const voix = new SpeechSynthesisUtterance(textePlante);
        voix.lang = 'fr-FR'; // Voix française
        voix.pitch = 1.2;    // Voix un peu plus aiguë pour une plante
        voix.rate = 0.9;     // Débit légèrement ralenti
        window.speechSynthesis.speak(voix);
    } else {
        console.warn("La synthèse vocale n'est pas supportée par ce navigateur.");
    }
}