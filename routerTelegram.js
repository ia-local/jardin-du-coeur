// Correction de l'import : on utilise node-telegram-bot-api et non telegraf
const TelegramBot = require('node-telegram-bot-api'); 
const fs = require('fs');

// Utilisation du token (priorité au .env, sinon ton token de test)
const token = process.env.TELEGRAM_TOKEN || '6796013823:AAGsNKHU5HUgBbFEodRferD-RhKXxi9SdDE';

// Initialisation du bot avec le polling activé
const bot = new TelegramBot(token, { polling: true });

const initTelegramRouter = (app) => {
    
    // Commande /status : Pour voir l'état des planches du 7 mai
    bot.onText(/\/status/, (msg) => {
        try {
            const db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
            let rapport = "🌱 *État du Jardin (Bavent)*\n\n";
            
            db.cultures_en_cours.forEach(c => {
                rapport += `📍 *${c.id_parcelle}* : ${c.id_plante}\n`;
                rapport += `📅 Planté le : 07/05/2026\n\n`;
            });
            
            bot.sendMessage(msg.chat.id, rapport, { parse_mode: 'Markdown' });
        } catch (err) {
            bot.sendMessage(msg.chat.id, "❌ Erreur lors de la lecture de la base de données.");
        }
    });

    // Commande /vote : Pour plannifier les ateliers de réinsertion
    bot.onText(/\/vote/, (msg) => {
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🔨 Menuiserie (Tuteurs)', callback_data: 'vote_menuiserie' },
                        { text: '🌿 Désherbage', callback_data: 'vote_desherbage' }
                    ]
                ]
            }
        };
        bot.sendMessage(msg.chat.id, "🗳️ *Votez pour le prochain atelier :*", { parse_mode: 'Markdown', ...opts });
    });

    // Gestion des réponses aux boutons (Callback Query)
    bot.on('callback_query', (query) => {
        const action = query.data.replace('vote_', '');
        bot.answerCallbackQuery(query.id, { text: "Vote pris en compte !" });
        bot.sendMessage(query.message.chat.id, `✅ Merci ! L'atelier *${action}* est ajouté au calendrier.`, { parse_mode: 'Markdown' });
    });
};

module.exports = initTelegramRouter;