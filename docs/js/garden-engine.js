/**
 * garden-engine.js - Moteur de rendu Three.js
 */
const GardenEngine = {
    scene: new THREE.Scene(),
    parcelles: [],
    camera: null, renderer: null, controls: null,

    init: function() {
        const container = document.getElementById('canvas-app');
        if (!container) return;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.camera.position.set(12.5, 15, 20); // Focus central

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(12.5, 0, 5);

        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(10, 20, 10);
        this.scene.add(sun);

        this.createGrid();
        this.setupRaycaster();
        this.animate();
    },

    createGrid: function() {
        const geo = new THREE.BoxGeometry(0.9, 0.1, 0.9);
        const mat = new THREE.MeshLambertMaterial({ color: 0x4B3621 });
        for(let x=0; x<25; x++) {
            for(let z=0; z<10; z++) {
                const p = new THREE.Mesh(geo, mat);
                p.position.set(x, 0, z);
                p.userData = { id: `L${x}-C${z}`, content: null, meshObj: null };
                this.scene.add(p);
                this.parcelles.push(p);
            }
        }
    },

    setView: function(mode) {
        if(mode === '2d') {
            this.camera.position.set(12.5, 22, 4.5);
            this.controls.enableRotate = false;
        } else {
            this.camera.position.set(12.5, 15, 20);
            this.controls.enableRotate = true;
        }
        this.controls.update();
    },

    clearAll: function() {
        this.parcelles.forEach(p => {
            if(p.userData.meshObj) {
                this.scene.remove(p.userData.meshObj);
                p.userData.meshObj = null;
                p.userData.content = null;
            }
        });
    },

    setupRaycaster: function() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const container = document.getElementById('canvas-app');

        container.addEventListener('pointerdown', (e) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.parcelles);
            if (intersects.length > 0) GardenUI.handleAction(intersects[0].object);
        });
    },

    animate: function() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
};

GardenEngine.init();