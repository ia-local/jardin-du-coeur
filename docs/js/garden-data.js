/**
 * garden-data.js - Gestion Entrées/Sorties JSON
 */
const GardenData = {
    // Exportation du plan actuel
    exportJSON: function() {
        const state = GardenEngine.parcelles
            .filter(p => p.userData.content)
            .map(p => ({
                id: p.userData.id,
                content: p.userData.content,
                date: new Date().toISOString().split('T')[0]
            }));
        
        const dataStr = JSON.stringify(state, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `plan_jardin_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Importation d'un plan existant
    importJSON: function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                // 1. Nettoyer le jardin actuel
                GardenEngine.clearAll();
                // 2. Replacer les éléments
                data.forEach(item => {
                    const parcel = GardenEngine.parcelles.find(p => p.userData.id === item.id);
                    if (parcel) {
                        GardenUI.place(parcel, item.content);
                    }
                });
                console.log("✅ Plan importé avec succès");
            } catch (err) {
                alert("Erreur lors de la lecture du fichier JSON.");
                console.error(err);
            }
        };
        reader.readAsText(file);
    }
};