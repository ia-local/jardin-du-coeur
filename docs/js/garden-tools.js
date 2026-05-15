const gardenTools = {
    selectedPlant: null,
    catalog: {
        'RADIS': { color: 0xe91e63, icon: 'fiber_manual_record' },
        'PANAIS': { color: 0xfff59d, icon: 'egg' },
        'POIREAU': { color: 0x81c784, icon: 'vertical_align_top' },
        'P_TERRE': { color: 0x795548, icon: 'lens' }
    },

    init() {
        const selector = document.getElementById('plant-selector');
        Object.keys(this.catalog).forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'c-plant-btn';
            btn.innerHTML = `<span class="material-icons" style="color:#${this.catalog[key].color.toString(16)}">${this.catalog[key].icon}</span> ${key}`;
            btn.onclick = () => this.select(key);
            selector.appendChild(btn);
        });
    },

    select(key) {
        this.selectedPlant = { id: key, ...this.catalog[key] };
        document.getElementById('active-tool-name').innerText = key;
        // Optionnel : mise à jour visuelle des boutons
    },

    place(parcel) {
        if(!this.selectedPlant) return;
        
        // Nettoyage si déjà planté
        if(parcel.userData.mesh) gardenEngine.scene.remove(parcel.userData.mesh);

        const geo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 6);
        const mat = new THREE.MeshLambertMaterial({ color: this.selectedPlant.color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(parcel.position.x, 0.3, parcel.position.z);
        
        gardenEngine.scene.add(mesh);
        parcel.userData.mesh = mesh;
        parcel.userData.content = this.selectedPlant.id;
    }
};