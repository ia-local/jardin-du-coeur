/**
 * garden-ui.js - Gestion de la Légende et des Outils
 */
const GardenUI = {
    selectedTool: 'SELECT',
    catalog: {
        'SELECT': { label: 'Sélectionner', icon: 'near_me', color: 0x000000 },
        'RADIS': { label: 'Radis 18J', icon: 'fiber_manual_record', color: 0xFF4081 },
        'PANAIS': { label: 'Panais', icon: 'egg', color: 0xFFF9C4 },
        'POIREAU': { label: 'Poireaux', icon: 'vertical_align_top', color: 0x81C784 },
        'SALADE': { label: 'Salades', icon: 'eco', color: 0x2E7D32 },
        'P_TERRE': { label: 'P. de Terre', icon: 'lens', color: 0x795548 },
        'COURGE': { label: 'Courges', icon: 'trip_origin', color: 0xFFA726 },
        'OIGNON': { label: 'Oignons', icon: 'circle', color: 0xE0E0E0 },
        'CABANE': { label: 'Cabane', icon: 'home', color: 0x8B4513 },
        'DELETE': { label: 'Supprimer', icon: 'delete', color: 0x000000 }
    },

    init: function() {
        const list = document.getElementById('legend-list');
        if (!list) return;

        Object.keys(this.catalog).forEach(key => {
            const tool = this.catalog[key];
            const div = document.createElement('div');
            div.className = `c-tool-item ${key === 'SELECT' ? 'is-selected' : ''}`;
            div.id = `tool-${key}`;
            div.innerHTML = `<span class="material-icons" style="color:#${tool.color.toString(16).padStart(6, '0')}">${tool.icon}</span> ${tool.label}`;
            div.onclick = () => this.setTool(key);
            list.appendChild(div);
        });
    },

    setTool: function(key) {
        this.selectedTool = key;
        document.querySelectorAll('.c-tool-item').forEach(el => el.classList.remove('is-selected'));
        document.getElementById(`tool-${key}`).classList.add('is-selected');
        document.getElementById('tool-label').innerText = this.catalog[key].label.toUpperCase();
    },

    handleAction: function(p) {
        if(this.selectedTool === 'SELECT') {
            document.getElementById('ui-id').innerText = p.userData.id;
            document.getElementById('ui-content').innerText = p.userData.content || "Terre nue";
        } else if(this.selectedTool === 'DELETE') {
            this.clearParcel(p);
        } else {
            this.place(p, this.selectedTool);
        }
    },

    place: function(p, type) {
        this.clearParcel(p);
        const config = this.catalog[type];
        const geo = type === 'CABANE' ? new THREE.BoxGeometry(1.8, 2.5, 1.8) : new THREE.SphereGeometry(0.25);
        const obj = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: config.color }));
        
        obj.position.set(p.position.x, type === 'CABANE' ? 1.25 : 0.3, p.position.z);
        GardenEngine.scene.add(obj);
        p.userData.meshObj = obj;
        p.userData.content = type;
    },

    clearParcel: function(p) {
        if(p.userData.meshObj) {
            GardenEngine.scene.remove(p.userData.meshObj);
            p.userData.meshObj = null;
            p.userData.content = null;
        }
    }
};

GardenUI.init();