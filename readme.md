# 🌱 Les Jardins du Cœur - Système de Gestion Agronomique & Social

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-En_développement-orange.svg)
![IA](https://img.shields.io/badge/IA-Groq_Llama_3.1_8b-green.svg)
![Web3](https://img.shields.io/badge/Web3-CVNU_SmartContracts-purple.svg)

## 📖 Présentation du Projet
Initié par Valérie et soutenu par une équipe de bénévoles (Mickael et l'équipe grandissante), le projet **Les Jardins du Cœur** est situé à Bavent (Normandie). Il repose sur l'exploitation d'une parcelle solidaire de 250 m². 

Ce projet poursuit un double objectif :
1. **Solidarité Alimentaire :** Production maraîchère optimisée via des techniques d'assolement sur 4 ans.
2. **Réinsertion Professionnelle :** Valorisation des tâches au jardin (semis, menuiserie, récolte) via des ateliers d'apprentissage.

Le projet innove en couplant l'agriculture à la technologie : chaque action réalisée au jardin valide des compétences sur le **CV Numérique Universel (CVNU)** du bénévole, générant des unités de valeur (UTM) au sein d'une économie circulaire locale.

---

## 🎯 Cahier des Charges & Fonctionnalités Clés

L'application est une interface Web Full-Stack (Multi-pages) agissant comme un jumeau numérique et un centre de contrôle.

### 1. Cartographie & Jumeau Numérique
* **Vue Macro (Leaflet.js) :** Délimitation cadastrale de la zone de 250 m² et des infrastructures (pépinières, point d'eau).
* **Vue Micro (Three.js) :** Modélisation 3D interactive du plan de culture. La parcelle est découpée en mètres carrés cliquables pour interagir en temps réel avec les cultures.

### 2. Moteur Agronomique (JSON)
* **Base de Données Experte :** Les règles de plantation (distance, durée de levée, rendement) sont codées dans un fichier `database.json`.
* **Calcul de Charge de Travail :** L'application calcule automatiquement le temps nécessaire pour chaque action (ex: planter 25 tomates = 4h30 de travail).
* **Assolement Automatisé :** Gestion algorithmique de la rotation des familles botaniques (Solanacées, Légumineuses, etc.) sur 4 ans pour préserver le sol.

### 3. Intelligence Artificielle (L'Oracle)
* **Intégration Groq SDK (Llama-3.1-8b-instant) :** Une IA analyse le contexte (météo locale, type de sol, base de données plantes) pour fournir des conseils en temps réel aux encadrants.

### 4. Ateliers & Web3 (CVNU)
* **Synchronisation CVNU :** Liaison avec les Smart Contracts (`CVNU.sol`, `tvaCollector.sol`) via le script `CORE_SYSTEM_CVNU.js`.
* **Gamification Sociale :** La complétion d'un atelier (ex: "Préparation des semis") crédite automatiquement le portefeuille UTM du bénévole.

---

## 🏗️ Architecture Technique (Stack)

* **Front-End :** HTML5, CSS3 (Variables, CSS Grid/Flexbox), JavaScript Vanilla.
* **Moteurs de Rendu :** Three.js (3D), Leaflet.js (Cartographie 2D).
* **Back-End :** Node.js, Express.js.
* **Base de Données :** JSON (Flat file) optimisé pour des requêtes synchrones/asynchrones.
* **IA :** Groq API.
* **Blockchain/Logique d'état :** Solidity, Scripts `rup_manager.js`.

---

## 📂 Structure du Répertoire

```text
.
├── Makefile
├── readme.md (Cahier des charges)
├── database.json (Moteur agronomique et règles métiers)
├── oracle.js / serveur.js (Backend Node.js & API Groq)
├── docs/
│   ├── index.html (Portail d'entrée)
│   ├── css/ style.css (Charte graphique unifiée)
│   ├── js/ script.js (Logique front-end principale)
│   ├── pages/
│   │   ├── dashboard.html (Métriques et alertes)
│   │   ├── cartographie.html (Leaflet)
│   │   ├── plan-de-culture.html (Three.js 3D)
│   │   ├── fiche-plante.html (Encyclopédie JSON)
│   │   ├── calendrier.html (Gantt des cultures)
│   │   ├── assolement.html (Rotation sur 4 ans)
│   │   ├── atelier.html (Interface CVNU/UTM)
│   │   └── galery.html
│   ├── sol/ (Contrats Web3 CVNU)
│   └── core/ (Moteurs d'état et d'économie circulaire)
└── data/ (Images et médias)