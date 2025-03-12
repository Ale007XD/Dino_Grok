import { Pterodactyl } from './pterodactyl.js';
import { RockGenerator } from './rock.js';

export class Game {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 5;
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('game-container').appendChild(this.renderer.domElement);
    
    this.addLights();
    
    this.pterodactyl = new Pterodactyl();
    this.scene.add(this.pterodactyl.object);
    
    this.rockGenerator = new RockGenerator(this.scene);
    
    this.isGameOver = false;
    this.score = 0;
    this.scoreElement = document.getElementById('score');
    this.gameOverElement = document.getElementById('game-over');
    
    this.controls = {
      up: false,
      left: false,
      right: false
    };
    
    this.clock = new THREE.Clock();
    this.lastScoreUpdate = 0;
    
    this.setupEventListeners();
    this.animate();
  }

  addLights() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
  }

  setupEventListeners() {
    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          this.controls.up = true;
          break;
        case 'ArrowLeft':
          this.controls.left = true;
          break;
        case 'ArrowRight':
          this.controls.right = true;
          break;
        case ' ':
          if (this.isGameOver) this.restartGame();
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          this.controls.up = false;
          break;
        case 'ArrowLeft':
          this.controls.left = false;
          break;
        case 'ArrowRight':
          this.controls.right = false;
          break;
      }
    });

    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }

  updateScore(elapsedTime) {
    if (elapsedTime - this.lastScoreUpdate >= 1) {
      this.score += 1;
      this.scoreElement.textContent = `Счет: ${this.score}`;
      this.lastScoreUpdate = elapsedTime;
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.gameOverElement.classList.remove('hidden');
  }

  restartGame() {
    this.isGameOver = false;
    this.score = 0;
    this.scoreElement.textContent = `Счет: ${this.score}`;
    this.gameOverElement.classList.add('hidden');
    this.pterodactyl.reset();
    this.rockGenerator.reset();
    this.lastScoreUpdate = 0;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (this.isGameOver) {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    
    this.updateScore(elapsedTime);
    this.pterodactyl.update(this.controls, deltaTime);
    this.pterodactyl.animateWings(elapsedTime);
    this.rockGenerator.update(deltaTime, this.camera.position);
    
    if (this.pterodactyl.checkCollision(this.rockGenerator.getRocks())) {
      this.gameOver();
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}
