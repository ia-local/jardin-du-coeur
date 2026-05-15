require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { Groq } = require('groq-sdk');
const initTelegram = require('./routerTelegram');


const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de l'accès à Groq (nécessite un fichier .env avec GROQ_API_KEY)
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});
const BACKEND_URL = "https://ia-local.github.io/jardin-du-coeur/";
// Middlewares
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques de l'interface Web (votre dossier 'docs')
app.use(express.static(path.join(__dirname, 'docs')));
const telegramManager = initTelegram(app);
// Chargement en mémoire de votre base de données JSON pour la donner en contexte à l'IA
let gardenData = "";
try {
    const dbPath = path.join(__dirname, 'docs/database.json');
    if (fs.existsSync(dbPath)) {
        const rawData = fs.readFileSync(dbPath, 'utf8');
        // On convertit le JSON en chaîne de caractères pour l'injecter dans le prompt
        gardenData = `Voici les données agronomiques et ateliers actuels du projet : ${rawData}`;
    }
} catch (error) {
    console.error("Erreur lors du chargement de database.json :", error);
}
let chronoData = "";
try {
    const chronoPath = path.join(__dirname, 'docs/json/chronologie.json');
    if (fs.existsSync(chronoPath)) {
        chronoData = `Historique du projet : ${fs.readFileSync(chronoPath, 'utf8')}`;
    }
} catch (e) { console.error("Erreur lecture chronologie"); }
// --- serveur.js (Extrait des nouvelles routes) ---

/**
 * MOTEUR D'INCARNATION ET DE GUIDE
 * @param {string} mode - 'guide' (technique) ou 'incarnate' (JE)
 */
async function generatePlantResponse(mode, plantName, question = "") {
    const isIncarnate = mode === 'incarnate';
    
    // Contexte extrait de vos fichiers (ex: espacement 50cm pour tomates)
    const systemPrompt = `
        Tu es l'âme de la plante "${plantName}" située dans les Jardins du Cœur à Bavent.
        ${isIncarnate ? 'PARLE IMPÉRATIVEMENT À LA PREMIÈRE PERSONNE (JE).' : 'Réponds comme un expert botaniste.'}
        
        CONTEXTE TECHNIQUE :
        - Localisation : Normandie (climat humide, 14860).
        - Données de culture : ${gardenData}.
        - Historique récent : ${chronoData}.
        
        INSTRUCTIONS :
        - Si JE : Sois poétique, décris tes racines et ton besoin d'eau ou de soleil.
        - Si GUIDE : Donne l'espacement exact (ex: 50cm pour tomates), la densité et les compagnons.
        - Ton : Bienveillant et aligné sur les valeurs de Valérie.
    `;

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question || (isIncarnate ? "Comment te sens-tu aujourd'hui ?" : `Génère mon guide de culture complet.`) }
        ],
        model: "llama-3.1-8b-instant",
        temperature: isIncarnate ? 0.7 : 0.3,
    });

    return chatCompletion.choices[0].message.content;
}


// --- serveur.js ---
const SOUP_PATH = path.join(__dirname, 'data/soup.md');
// --- serveur.js (Incrémentation) ---

app.get('/api/galery', (req, res) => {
    const dirPath = path.join(__dirname, 'docs/pages/galery');
    
    fs.readdir(dirPath, (err, files) => {
        if (err) return res.status(500).json({ error: "Dossier galery introuvable" });
        
        // On filtre pour ne garder que les images
        const images = files
            .filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i))
            .map(file => {
                const stats = fs.statSync(path.join(dirPath, file));
                return {
                    url: `docs/pages/galery/${file}`,
                    name: file.startsWith('tg_') ? "Photo du Terrain (Telegram)" : file,
                    date: stats.mtime.toLocaleDateString('fr-FR')
                };
            })
            .sort((a, b) => b.date - a.date); // Plus récentes d'abord

        res.json(images);
    });
});
// Route pour enregistrer la conversation et les "AGI Thoughts"
app.post('/api/sync-soup', (req, res) => {
    const { content, sessionID, type } = req.body;
    const timestamp = new Date().toISOString();
    
    const logEntry = `\n\n### [${timestamp}] - Session: ${sessionID} - Type: ${type}\n${content}`;

    try {
        fs.appendFileSync(SOUP_PATH, logEntry, 'utf8');
        res.json({ success: true, message: "Mémoire synchronisée dans soup.md" });
    } catch (err) {
        res.status(500).json({ error: "Échec de l'écriture mémoire" });
    }
});
app.get('/api/gallery-list', (req, res) => {
    const directoryPath = path.join(__dirname, 'docs/pages/galery');
    fs.readdir(directoryPath, (err, files) => {
        if (err) return res.status(500).json({ error: "Dossier introuvable" });
        const images = files.filter(f => f.match(/\.(jpg|jpeg|png|gif)$/));
        res.json({ images });
    });
});
// ==========================================
// DEFINITION DU CONTEXTE SYSTEME (L'Oracle)
// ==========================================
const SYSTEM_PROMPT = `
Tu es "l'Oracle Botanique et Social" du projet "Les Jardins du Cœur", initié par Valérie.
CONTEXTE : Jardin solidaire de 250 m² à Bavent, Normandie (climat océanique). Objectif double : production maraîchère et réinsertion professionnelle. Les actions des bénévoles valident des compétences sur leur CVNU (Curriculum Vitae Numérique Universel) et génèrent des points (UTM).
RÔLE : Conseiller sur les rotations de cultures, les dates de semis/récolte, et relier ces tâches agronomiques aux ateliers de réinsertion (ex: menuiserie, pépinière).
TON : Pédagogue, bienveillant, et techniquement rigoureux ${gardenData} ${chronoData} ....
${gardenData}
`;

// ==========================================
// ROUTE API : Connexion Frontend <-> Groq IA
// ==========================================
app.post('/api/oracle', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: "La question est requise." });
        }

        // Appel au modèle LLaMA 3.1 8B via Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: question }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.4, // Température basse/moyenne pour des conseils agronomiques précis
            max_tokens: 1024,
        });

        // Renvoi de la réponse au frontend
        res.json({
            success: true,
            reponse: chatCompletion.choices[0].message.content,
            modele_utilise: "llama-3.1-8b-instant"
        });

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Groq :", error);
        res.status(500).json({ error: "L'Oracle est momentanément indisponible." });
    }
});
// Nouveau End-Point pour la "Voix" des plantes
app.post('/api/plant-voice', async (req, res) => {
    try {
        const { nomPlante, etatSol } = req.body;

        // Prompt systémique forçant le modèle à jouer le rôle de la plante
        const promptVoix = `Tu es une plante du Jardin du Cœur. Tu es un(e) ${nomPlante}. Le sol actuel est ${etatSol}. 
        Parle à la première personne (Je). Fais une seule phrase courte (max 15 mots) pour dire comment tu te sens aujourd'hui en Normandie. 
        Sois vivant et poétique, mais très bref. Ne dis pas "Bonjour".`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: promptVoix }],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 50,
        });

        res.json({ success: true, texte_parle: chatCompletion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: "Je n'ai plus de voix aujourd'hui..." });
    }
});
// Route de fallback pour renvoyer index.html (utile pour la navigation de type Single Page App)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});
// Endpoint spécifique pour le Codex
app.post('/api/codex/plant', async (req, res) => {
    const { plant, mode, question } = req.body;
    try {
        const reponse = await generatePlantResponse(mode, plant, question);
        res.json({ success: true, reponse });
    } catch (error) {
        res.status(500).json({ error: "Erreur du Codex." });
    }
});
// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🌱 Serveur "Jardins du Cœur" démarré sur le port ${PORT}`);
    console.log(`🔌 API IA disponible sur http://localhost:${PORT}/api/oracle`);
});