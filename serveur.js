require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { Groq } = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de l'accès à Groq (nécessite un fichier .env avec GROQ_API_KEY)
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Middlewares
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques de l'interface Web (votre dossier 'docs')
app.use(express.static(path.join(__dirname, 'docs')));

// Chargement en mémoire de votre base de données JSON pour la donner en contexte à l'IA
let gardenData = "";
try {
    const dbPath = path.join(__dirname, 'database.json');
    if (fs.existsSync(dbPath)) {
        const rawData = fs.readFileSync(dbPath, 'utf8');
        // On convertit le JSON en chaîne de caractères pour l'injecter dans le prompt
        gardenData = `Voici les données agronomiques et ateliers actuels du projet : ${rawData}`;
    }
} catch (error) {
    console.error("Erreur lors du chargement de database.json :", error);
}

// ==========================================
// DEFINITION DU CONTEXTE SYSTEME (L'Oracle)
// ==========================================
const SYSTEM_PROMPT = `
Tu es "l'Oracle Botanique et Social" du projet "Les Jardins du Cœur", initié par Valérie.
CONTEXTE : Jardin solidaire de 250 m² à Bavent, Normandie (climat océanique). Objectif double : production maraîchère et réinsertion professionnelle. Les actions des bénévoles valident des compétences sur leur CVNU (Curriculum Vitae Numérique Universel) et génèrent des points (UTM).
RÔLE : Conseiller sur les rotations de cultures, les dates de semis/récolte, et relier ces tâches agronomiques aux ateliers de réinsertion (ex: menuiserie, pépinière).
TON : Pédagogue, bienveillant, et techniquement rigoureux.
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

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🌱 Serveur "Jardins du Cœur" démarré sur le port ${PORT}`);
    console.log(`🔌 API IA disponible sur http://localhost:${PORT}/api/oracle`);
});