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