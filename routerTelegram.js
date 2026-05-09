/**
 * @file routerTelegram.js
 * @description Interface entre Telegram, Groq SDK et le Noyau CORE_SYSTEM_CVNU.js
 */

const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

// Import du Noyau CVNU (Node.js version)
const { system, KERNEL } = require('./docs/core/CORE_SYSTEM_CVNU');

// Configuration des Tokens
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY; // À définir dans votre .env

// Initialisation des clients
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const groq = new Groq({ apiKey: GROQ_API_KEY });

const SALON_LINK = "https://t.me/+EQHW1jF1J_84NGM0";

const initTelegramRouter = (app) => {

    console.log("📡 Bot Telegram synchronisé avec le Noyau CVNU...");

    // 1. COMMANDE /start
    bot.onText(/\/start/, (msg) => {
        const welcome = `🌿 *Bienvenue Mickael sur l'Oracle des Jardins du Cœur*\n\n` +
            `Je suis synchronisé avec le jumeau numérique de Bavent.\n` +
            `🔗 Rejoignez le salon : [Lien du Groupe](${SALON_LINK})\n\n` +
            `*Commandes disponibles :*\n` +
            `- /status : État des planches du 7 mai\n` +
            `- /vote : Plannifier un atelier\n` +
            `- /cvnu [cmd] : Exécuter une commande système (ex: /cvnu /stats)\n` +
            `- Posez-moi simplement une question pour l'Oracle.`;
        
        bot.sendMessage(msg.chat.id, welcome, { parse_mode: 'Markdown' });
    });

    // 2. COMMANDE /status (Lecture database.json)
    bot.onText(/\/status/, (msg) => {
        try {
            const db = JSON.parse(fs.readFileSync('./docs/database.json', 'utf8'));
            let rapport = "📍 *État des Cultures (Bavent)*\n";
            rapport += "-----------------------------------\n";
            
            db.cultures_en_cours.forEach(c => {
                rapport += `🌱 *${c.id_parcelle}* : ${c.id_plante}\n`;
                rapport += `📅 Semé/Planté le : 07/05/2026\n\n`;
            });
            
            bot.sendMessage(msg.chat.id, rapport, { parse_mode: 'Markdown' });
        } catch (err) {
            bot.sendMessage(msg.chat.id, "❌ Erreur de lecture de la database.");
        }
    });

    // 3. PONT CVNU : Exécuter les commandes de CORE_SYSTEM_CVNU.js
    bot.onText(/\/cvnu (.+)/, (msg, match) => {
        const cmdId = match[1]; // ex: "/stats" ou "/skills"
        
        // On appelle le gestionnaire de commandes du Kernel
        const result = system.onCommandReceive(cmdId);
        
        // Nettoyage des caractères ASCII pour le rendu mobile
        const cleanResult = result.replace(/[╔╗╚╝═║╠╣╦╩╬]/g, '');
        
        bot.sendMessage(msg.chat.id, `⚙️ *KERNEL CVNU OUTPUT :*\n\`\`\`\n${cleanResult}\n\`\`\``, { parse_mode: 'Markdown' });
    });

    // 4. L'ORACLE (Interaction IA Groq via groq-sdk)
    bot.on('message', async (msg) => {
        // On ignore si c'est une commande connue ou si c'est un message du bot
        if (msg.text && msg.text.startsWith('/')) return;

        const chatId = msg.chat.id;
        const userQuestion = msg.text;

        try {
            // Lecture du contexte du jardin pour l'IA
            const gardenData = fs.readFileSync('./docs/database.json', 'utf8');

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        content: `Tu es l'Oracle des Jardins du Cœur. Mickael est l'architecte. 
                        Voici les données actuelles du jardin de Bavent : ${gardenData}. 
                        Réponds de manière technique mais bienveillante. 
                        Les plantations datent du 7 mai 2026.` 
                    },
                    { role: "user", content: userQuestion }
                ],
                model: "llama-3.1-8b-instant",
            });

            const oracleReply = chatCompletion.choices[0].message.content;
            bot.sendMessage(chatId, `🔮 *L'Oracle :*\n\n${oracleReply}`, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error("Erreur Groq:", error);
            if (!GROQ_API_KEY) {
                bot.sendMessage(chatId, "⚠️ L'API Groq n'est pas configurée sur le serveur.");
            }
        }
    });

    // 5. GESTION DES VOTES (Ateliers)
    bot.onText(/\/vote/, (msg) => {
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔨 Construction Tuteurs', callback_data: 'vote_tuteurs' }],
                    [{ text: '🌿 Désherbage Zone A', callback_data: 'vote_desherbage' }]
                ]
            }
        };
        bot.sendMessage(msg.chat.id, "🗳️ *Planification des ateliers de réinsertion :*", { parse_mode: 'Markdown', ...opts });
    });

    bot.on('callback_query', (query) => {
        const action = query.data.replace('vote_', '');
        bot.answerCallbackQuery(query.id, { text: "Vote enregistré !" });
        bot.sendMessage(query.message.chat.id, `✅ Vote pour l'atelier *${action}* pris en compte.`);
    });
};

module.exports = initTelegramRouter;