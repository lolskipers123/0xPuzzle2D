import { 
  PuzzleLevel, 
  PuzzleSwitchData, 
  PuzzleDialData, 
  PuzzleEvaluation, 
  Platform, 
  Particle, 
  FloatingText 
} from './types';
import { PUZZLE_LEVELS } from './levels';
import { sounds } from './audio';

export class PuzzleEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Responsive rendering: text drawn on the canvas is scaled up on small screens
  // so labels stay legible when the 960x580 room is shrunk to a phone width.
  private fontBoost = 1;
  private resizeObserver: ResizeObserver | null = null;
  private pointerHandler: ((e: PointerEvent) => void) | null = null;

  // Viewport / Room Dimensions
  public readonly ROOM_WIDTH = 960;
  public readonly ROOM_HEIGHT = 580;

  // Current Level
  public currentLevel: PuzzleLevel;
  public currentSwitches: PuzzleSwitchData[] = [];
  public currentDials: PuzzleDialData[] = [];
  public currentPlatforms: Platform[] = [];
  public currentEvaluation: PuzzleEvaluation;

  // Game Stats
  public movesCount: number = 0;
  public startTime: number = 0;
  public elapsedTime: number = 0; // in seconds
  public isCompleted: boolean = false;
  private wasSolved: boolean = false;

  // Player physics state
  public player = {
    x: 80,
    y: 460,
    vx: 0,
    vy: 0,
    width: 28,
    height: 44,
    isGrounded: false,
    jumpCount: 0,
    maxJumps: 2,
    facing: 1 as 1 | -1, // 1 right, -1 left
    walkTimer: 0,
    walkFrame: 0,
  };

  // Keyboard controls
  // Analog stick input from touch controls: -1 (full left) .. 1 (full right)
  public analogX = 0;

  public keys = {
    left: false,
    right: false,
    up: false,
    jump: false,
    interact: false,
  };

  // FX & Visuals
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  private gateParticleTimer: number = 0;

  // Callbacks
  public onEvaluationChange?: (evalResult: PuzzleEvaluation, moves: number, time: number) => void;
  public onLevelComplete?: (levelId: number, moves: number, time: number, stars: number) => void;

  constructor(canvas: HTMLCanvasElement, initialLevelId: number = 1) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    const lvl = PUZZLE_LEVELS.find(l => l.id === initialLevelId) || PUZZLE_LEVELS[0];
    this.currentLevel = lvl;
    this.currentEvaluation = {
      isSolved: false,
      currentValueText: '',
      targetValueText: '',
      matchDetails: '',
      percentMatch: 0
    };

    this.loadLevel(initialLevelId);
    this.setupMouseClick();
    this.setupResponsiveText();
  }

  private font(weight: string, px: number): string {
    return `${weight}${Math.round(px * this.fontBoost)}px "JetBrains Mono", monospace`;
  }

  private setupResponsiveText() {
    const update = () => {
      const w = this.canvas.getBoundingClientRect().width;
      if (!w) return;
      const scale = w / this.ROOM_WIDTH; // CSS px per canvas px
      // Aim for ~6.5 CSS px for the smallest labels (9px), capped so layouts don't collide.
      this.fontBoost = Math.min(1.35, Math.max(1, 6.5 / (9 * scale)));
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(update);
      this.resizeObserver.observe(this.canvas);
    }
  }

  public loadLevel(levelId: number) {
    const lvl = PUZZLE_LEVELS.find(l => l.id === levelId) || PUZZLE_LEVELS[0];
    this.currentLevel = lvl;

    // Deep copy switches & dials so edits don't mutate template
    this.currentSwitches = lvl.switches.map(s => ({ ...s }));
    this.currentDials = lvl.dials.map(d => ({ ...d }));
    this.currentPlatforms = lvl.platforms.map(p => ({ ...p }));

    // Reset player
    this.player.x = lvl.playerSpawn.x;
    this.player.y = lvl.playerSpawn.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.jumpCount = 0;
    this.player.isGrounded = false;

    // Reset stats
    this.movesCount = 0;
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.isCompleted = false;
    this.wasSolved = false;
    this.particles = [];
    this.floatingTexts = [];

    // Evaluate initial state
    this.currentEvaluation = lvl.evaluate(this.currentSwitches, this.currentDials);
    this.wasSolved = this.currentEvaluation.isSolved;
    this.onEvaluationChange?.(this.currentEvaluation, this.movesCount, this.elapsedTime);
  }

  public resetCurrentLevel() {
    this.loadLevel(this.currentLevel.id);
    this.addFloatingText('Level Reset', this.player.x, this.player.y - 20, '#38bdf8');
  }

  private setupMouseClick() {
    this.pointerHandler = (e: PointerEvent) => {
      sounds.enableAudioOnGesture();
      const rect = this.canvas.getBoundingClientRect();
      // The canvas is displayed with object-fit: contain, so map through the
      // actually-drawn area (handles any letterboxing) rather than the element box.
      const fit = Math.min(rect.width / this.ROOM_WIDTH, rect.height / this.ROOM_HEIGHT);
      const drawnW = this.ROOM_WIDTH * fit;
      const drawnH = this.ROOM_HEIGHT * fit;
      const offX = rect.left + (rect.width - drawnW) / 2;
      const offY = rect.top + (rect.height - drawnH) / 2;
      const clickX = (e.clientX - offX) / fit;
      const clickY = (e.clientY - offY) / fit;

      // 1. Check if clicked a switch
      for (const sw of this.currentSwitches) {
        if (
          clickX >= sw.x &&
          clickX <= sw.x + sw.width &&
          clickY >= sw.y &&
          clickY <= sw.y + sw.height
        ) {
          this.toggleSwitch(sw);
          return;
        }
      }

      // 2. Check if clicked a dial
      for (const dial of this.currentDials) {
        if (
          clickX >= dial.x &&
          clickX <= dial.x + dial.width &&
          clickY >= dial.y &&
          clickY <= dial.y + dial.height
        ) {
          // If clicked in upper half, increment; if lower half, decrement
          const isUpper = clickY < dial.y + dial.height / 2;
          this.stepDial(dial, isUpper ? 1 : -1);
          return;
        }
      }

      // 3. Check if clicked exit gate
      const gate = this.currentLevel.exitGate;
      if (
        this.currentEvaluation.isSolved &&
        clickX >= gate.x &&
        clickX <= gate.x + gate.width &&
        clickY >= gate.y &&
        clickY <= gate.y + gate.height
      ) {
        this.completeLevel();
      }
    };
    this.canvas.addEventListener('pointerdown', this.pointerHandler);
  }

  public triggerJump() {
    sounds.enableAudioOnGesture();
    if (this.player.isGrounded || this.player.jumpCount < this.player.maxJumps) {
      if (this.player.jumpCount === 0) {
        sounds.playJump();
        this.player.vy = -10.5;
      } else {
        sounds.playDoubleJump();
        this.player.vy = -9.2;
        this.spawnJumpParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height);
      }
      this.player.jumpCount++;
      this.player.isGrounded = false;
    }
  }

  public triggerInteract() {
    sounds.enableAudioOnGesture();
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;

    // Check switches in proximity
    for (const sw of this.currentSwitches) {
      const swCx = sw.x + sw.width / 2;
      const swCy = sw.y + sw.height / 2;
      const dist = Math.hypot(px - swCx, py - swCy);
      if (dist < 64) {
        this.toggleSwitch(sw);
        return;
      }
    }

    // Check dials in proximity
    for (const dial of this.currentDials) {
      const dCx = dial.x + dial.width / 2;
      const dCy = dial.y + dial.height / 2;
      const dist = Math.hypot(px - dCx, py - dCy);
      if (dist < 72) {
        this.stepDial(dial, 1);
        return;
      }
    }

    // Check exit gate
    const gate = this.currentLevel.exitGate;
    const gCx = gate.x + gate.width / 2;
    const gCy = gate.y + gate.height / 2;
    if (Math.hypot(px - gCx, py - gCy) < 80 && this.currentEvaluation.isSolved) {
      this.completeLevel();
    }
  }

  public toggleSwitch(sw: PuzzleSwitchData) {
    sw.value = sw.value === 1 ? 0 : 1;
    this.movesCount++;
    sounds.playBitFlip(sw.value === 1);

    this.addFloatingText(
      sw.value === 1 ? `1 (ON)` : `0 (OFF)`,
      sw.x + sw.width / 2,
      sw.y - 10,
      sw.value === 1 ? '#10b981' : '#94a3b8'
    );

    this.spawnSwitchSparks(sw.x + sw.width / 2, sw.y + sw.height / 2, sw.value === 1 ? '#10b981' : '#64748b');
    this.checkPuzzleState();
  }

  public stepDial(dial: PuzzleDialData, direction: number = 1) {
    this.movesCount++;
    sounds.playHexDial();

    let nextVal = dial.value + direction * dial.step;
    if (nextVal > dial.max) nextVal = dial.min;
    if (nextVal < dial.min) nextVal = dial.max;
    dial.value = nextVal;

    let displayStr = '';
    if (dial.format === 'hex') {
      displayStr = '0x' + dial.value.toString(16).toUpperCase();
    } else if (dial.format === 'byte-hex') {
      displayStr = '0x' + dial.value.toString(16).padStart(2, '0').toUpperCase();
    } else {
      displayStr = dial.value.toString();
    }

    this.addFloatingText(displayStr, dial.x + dial.width / 2, dial.y - 12, dial.color || '#38bdf8');
    this.spawnSwitchSparks(dial.x + dial.width / 2, dial.y + dial.height / 2, dial.color || '#38bdf8');
    this.checkPuzzleState();
  }

  private checkPuzzleState() {
    this.currentEvaluation = this.currentLevel.evaluate(this.currentSwitches, this.currentDials);

    if (this.currentEvaluation.isSolved && !this.wasSolved) {
      this.wasSolved = true;
      sounds.playGateUnlock();
      sounds.playCipherCorrect();
      this.spawnGateCelebrationSparks();
      this.addFloatingText('BARRIER DEACTIVATED! GATE ONLINE', 480, 200, '#10b981');
    } else if (!this.currentEvaluation.isSolved && this.wasSolved) {
      this.wasSolved = false;
      sounds.playLaserHum();
    }

    this.onEvaluationChange?.(this.currentEvaluation, this.movesCount, this.elapsedTime);
  }

  private completeLevel() {
    if (this.isCompleted) return;
    this.isCompleted = true;
    sounds.playVictoryFanfare();

    // Calculate stars (1 to 3) based on par moves and time
    let stars = 1;
    if (this.movesCount <= this.currentLevel.parMoves && this.elapsedTime <= this.currentLevel.parTime) {
      stars = 3;
    } else if (this.movesCount <= this.currentLevel.parMoves * 1.5 || this.elapsedTime <= this.currentLevel.parTime * 1.5) {
      stars = 2;
    }

    this.spawnGateCelebrationSparks();
    this.onLevelComplete?.(this.currentLevel.id, this.movesCount, Math.round(this.elapsedTime), stars);
  }

  public start() {
    this.lastTime = performance.now();
    this.startTime = Date.now();
    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.pointerHandler) {
      this.canvas.removeEventListener('pointerdown', this.pointerHandler);
      this.pointerHandler = null;
    }
    this.keys.left = false;
    this.keys.right = false;
    this.analogX = 0;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private update(dt: number) {
    if (!this.isCompleted) {
      this.elapsedTime = (Date.now() - this.startTime) / 1000;
    }

    // Horizontal Movement
    const moveSpeed = 4.4;
    const accel = 0.8;
    const friction = 0.78;

    // Combine keyboard / buttons (full speed) with the analog stick (speed scales with tilt)
    const DEADZONE = 0.15;
    let dir = 0;
    let power = 1;
    if (this.keys.left) dir = -1;
    else if (this.keys.right) dir = 1;
    else if (Math.abs(this.analogX) > DEADZONE) {
      dir = this.analogX < 0 ? -1 : 1;
      power = Math.min(1, (Math.abs(this.analogX) - DEADZONE) / (1 - DEADZONE));
      power = Math.max(0.35, power); // always enough speed to actually move once past the deadzone
    }

    if (dir < 0) {
      this.player.vx = Math.max(this.player.vx - accel * power, -moveSpeed * power);
      this.player.facing = -1;
      this.player.walkTimer += dt * 10 * power;
      this.player.walkFrame = Math.floor(this.player.walkTimer) % 4;
    } else if (dir > 0) {
      this.player.vx = Math.min(this.player.vx + accel * power, moveSpeed * power);
      this.player.facing = 1;
      this.player.walkTimer += dt * 10 * power;
      this.player.walkFrame = Math.floor(this.player.walkTimer) % 4;
    } else {
      this.player.vx *= friction;
      if (Math.abs(this.player.vx) < 0.1) this.player.vx = 0;
      this.player.walkFrame = 0;
    }

    // Gravity
    this.player.vy += 0.52;
    if (this.player.vy > 12) this.player.vy = 12;

    // Apply movement
    this.player.x += this.player.vx;
    this.checkPlatformCollisionHorizontal();

    this.player.y += this.player.vy;
    this.player.isGrounded = false;
    this.checkPlatformCollisionVertical();

    // Bounds checking
    if (this.player.x < 10) {
      this.player.x = 10;
      this.player.vx = 0;
    }
    if (this.player.x + this.player.width > this.ROOM_WIDTH - 10) {
      this.player.x = this.ROOM_WIDTH - 10 - this.player.width;
      this.player.vx = 0;
    }
    if (this.player.y + this.player.height > this.ROOM_HEIGHT - 60) {
      this.player.y = this.ROOM_HEIGHT - 60 - this.player.height;
      this.player.vy = 0;
      this.player.isGrounded = true;
      this.player.jumpCount = 0;
    }

    // Laser barrier collision (blocks player if not solved)
    if (!this.currentEvaluation.isSolved) {
      const lb = this.currentLevel.laserBarrier;
      if (
        this.player.x + this.player.width > lb.x &&
        this.player.x < lb.x + lb.width &&
        this.player.y + this.player.height > lb.y &&
        this.player.y < lb.y + lb.height
      ) {
        // Push back
        this.player.x = lb.x - this.player.width - 2;
        this.player.vx = -2;
        sounds.playLaserHum();
        this.spawnLaserSparks(lb.x, this.player.y + 20);
      }
    } else {
      // If solved, walking directly into exit gate completes level!
      const gate = this.currentLevel.exitGate;
      if (
        this.player.x + this.player.width > gate.x + 10 &&
        this.player.x < gate.x + gate.width - 10 &&
        this.player.y + this.player.height > gate.y + 20 &&
        this.player.y < gate.y + gate.height
      ) {
        this.completeLevel();
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Ambient particles at exit gate when unlocked
    if (this.currentEvaluation.isSolved) {
      this.gateParticleTimer += dt;
      if (this.gateParticleTimer > 0.08) {
        this.gateParticleTimer = 0;
        const gate = this.currentLevel.exitGate;
        this.particles.push({
          x: gate.x + Math.random() * gate.width,
          y: gate.y + gate.height - 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -1.5 - Math.random() * 2.5,
          size: 2.5 + Math.random() * 2.5,
          color: Math.random() > 0.5 ? '#10b981' : '#38bdf8',
          alpha: 0.9,
          decay: 0.02
        });
      }
    }
  }

  private checkPlatformCollisionVertical() {
    for (const plat of this.currentPlatforms) {
      if (
        this.player.x + this.player.width > plat.x &&
        this.player.x < plat.x + plat.width
      ) {
        // Falling down onto platform top
        if (
          this.player.vy >= 0 &&
          this.player.y + this.player.height >= plat.y &&
          this.player.y + this.player.height - this.player.vy <= plat.y + 12
        ) {
          this.player.y = plat.y - this.player.height;
          this.player.vy = 0;
          this.player.isGrounded = true;
          this.player.jumpCount = 0;
          break;
        }
      }
    }
  }

  private checkPlatformCollisionHorizontal() {
    for (const plat of this.currentPlatforms) {
      if (plat.type !== 'solid') continue;
      if (
        this.player.y + this.player.height > plat.y + 8 &&
        this.player.y < plat.y + plat.height - 4
      ) {
        // Moving right into platform left
        if (this.player.vx > 0 && this.player.x + this.player.width >= plat.x && this.player.x < plat.x) {
          this.player.x = plat.x - this.player.width;
          this.player.vx = 0;
        }
        // Moving left into platform right
        else if (this.player.vx < 0 && this.player.x <= plat.x + plat.width && this.player.x + this.player.width > plat.x + plat.width) {
          this.player.x = plat.x + plat.width;
          this.player.vx = 0;
        }
      }
    }
  }

  // --- Rendering ---
  public render() {
    const ctx = this.ctx;
    const w = this.ROOM_WIDTH;
    const h = this.ROOM_HEIGHT;

    // 1. Dark Cyber Lab Room Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 2. Render Platforms
    for (const plat of this.currentPlatforms) {
      this.renderPlatform(plat);
    }

    // 3. Render Power Conduits & Wires
    this.renderConduits();

    // 4. Render Laser Security Barrier
    this.renderLaserBarrier();

    // 5. Render Exit Gateway Portal
    this.renderExitGate();

    // 6. Render Color Preview Crystal (if color level)
    if (this.currentLevel.category === 'color') {
      this.renderColorCrystal();
    }

    // 7. Render Puzzle Switches
    for (const sw of this.currentSwitches) {
      this.renderSwitch(sw);
    }

    // 8. Render Puzzle Dials
    for (const dial of this.currentDials) {
      this.renderDial(dial);
    }

    // 9. Render Player Character
    this.renderPlayer();

    // 10. Render Proximity Hints
    this.renderProximityPrompts();

    // 11. Render Particles & Floating Texts
    this.renderFX();
  }

  private renderPlatform(plat: Platform) {
    const ctx = this.ctx;
    ctx.save();

    // Platform body
    ctx.fillStyle = plat.color || '#1e293b';
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

    // Top edge highlight / glow
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(plat.x, plat.y, plat.width, 3);

    // Subtle border
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

    // Optional platform sign label
    if (plat.label && plat.width > 100) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = this.font('', 10);
      ctx.textAlign = 'center';
      ctx.fillText(plat.label, plat.x + plat.width / 2, plat.y + 13);
    }

    ctx.restore();
  }

  private renderConduits() {
    const ctx = this.ctx;
    ctx.save();

    const isSolved = this.currentEvaluation.isSolved;
    const wireColor = isSolved ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.15)';
    ctx.strokeStyle = wireColor;
    ctx.lineWidth = 2;

    // Connect switches with a horizontal power conduit line
    if (this.currentSwitches.length > 1) {
      ctx.beginPath();
      const first = this.currentSwitches[0];
      const last = this.currentSwitches[this.currentSwitches.length - 1];
      const busY = Math.min(first.y + first.height + 8, this.ROOM_HEIGHT - 65);
      ctx.moveTo(first.x + first.width / 2, busY);
      ctx.lineTo(last.x + last.width / 2, busY);
      ctx.stroke();

      // Vertical taps to each switch
      for (const sw of this.currentSwitches) {
        ctx.beginPath();
        ctx.moveTo(sw.x + sw.width / 2, sw.y + sw.height);
        ctx.lineTo(sw.x + sw.width / 2, busY);
        ctx.stroke();
      }

      // Conduit to laser barrier
      const barrier = this.currentLevel.laserBarrier;
      ctx.beginPath();
      ctx.moveTo(last.x + last.width / 2, busY);
      ctx.lineTo(barrier.x, busY);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderLaserBarrier() {
    const ctx = this.ctx;
    const lb = this.currentLevel.laserBarrier;
    const isSolved = this.currentEvaluation.isSolved;

    ctx.save();
    if (!isSolved) {
      // Emitters at top & bottom
      ctx.fillStyle = '#64748b';
      ctx.fillRect(lb.x - 3, lb.y - 8, lb.width + 6, 8);
      ctx.fillRect(lb.x - 3, lb.y + lb.height, lb.width + 6, 8);

      // Red/Crimson laser core
      const pulse = 0.75 + Math.sin(Date.now() / 120) * 0.25;
      ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.4})`;
      ctx.fillRect(lb.x - 6, lb.y, lb.width + 12, lb.height);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(lb.x + 3, lb.y, lb.width - 6, lb.height);

      // Laser sparks & jitter
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lb.x + lb.width / 2, lb.y);
      for (let y = lb.y; y < lb.y + lb.height; y += 20) {
        const jitter = (Math.random() - 0.5) * 6;
        ctx.lineTo(lb.x + lb.width / 2 + jitter, y);
      }
      ctx.lineTo(lb.x + lb.width / 2, lb.y + lb.height);
      ctx.stroke();

      // "BARRIER LOCKED" Hologram Tag
      ctx.fillStyle = '#f87171';
      ctx.font = this.font('bold ', 9);
      ctx.textAlign = 'center';
      ctx.fillText('LOCKED', lb.x + lb.width / 2, lb.y - 14);
    } else {
      // Deactivated emitter
      ctx.fillStyle = '#10b981';
      ctx.fillRect(lb.x - 2, lb.y - 6, lb.width + 4, 6);
      ctx.fillRect(lb.x - 2, lb.y + lb.height, lb.width + 4, 6);

      // Soft green pass indicator
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(lb.x, lb.y, lb.width, lb.height);

      ctx.fillStyle = '#10b981';
      ctx.font = this.font('bold ', 9);
      ctx.textAlign = 'center';
      ctx.fillText('OPEN', lb.x + lb.width / 2, lb.y - 14);
    }
    ctx.restore();
  }

  private renderExitGate() {
    const ctx = this.ctx;
    const gate = this.currentLevel.exitGate;
    const isSolved = this.currentEvaluation.isSolved;
    const time = Date.now() / 600;

    ctx.save();

    // Portal arch base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(gate.x - 4, gate.y - 4, gate.width + 8, gate.height + 8);
    ctx.strokeStyle = isSolved ? '#10b981' : '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(gate.x - 4, gate.y - 4, gate.width + 8, gate.height + 8);

    // Inner vortex chamber
    const vortexGrad = ctx.createRadialGradient(
      gate.x + gate.width / 2,
      gate.y + gate.height / 2,
      5,
      gate.x + gate.width / 2,
      gate.y + gate.height / 2,
      gate.width / 2
    );

    if (isSolved) {
      vortexGrad.addColorStop(0, '#ecfdf5');
      vortexGrad.addColorStop(0.4, '#10b981');
      vortexGrad.addColorStop(1, '#064e3b');
    } else {
      vortexGrad.addColorStop(0, '#334155');
      vortexGrad.addColorStop(0.7, '#1e293b');
      vortexGrad.addColorStop(1, '#090d16');
    }

    ctx.fillStyle = vortexGrad;
    ctx.fillRect(gate.x, gate.y, gate.width, gate.height);

    // Rotating Energy Rings (when online)
    if (isSolved) {
      const cx = gate.x + gate.width / 2;
      const cy = gate.y + gate.height / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 18, 38, time, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy, 12, 28, -time * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Top sign
      ctx.fillStyle = '#10b981';
      ctx.font = this.font('bold ', 11);
      ctx.textAlign = 'center';
      ctx.fillText('EXIT PORTAL', cx, gate.y - 12);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = this.font('', 10);
      ctx.textAlign = 'center';
      ctx.fillText('OFFLINE', gate.x + gate.width / 2, gate.y - 12);
    }

    ctx.restore();
  }

  private renderColorCrystal() {
    const ctx = this.ctx;
    const cx = 800;
    const cy = 200;
    const currentColor = this.currentEvaluation.colorPreview || '#000000';

    ctx.save();
    // Glass dome
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Colored Core
    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = this.font('', 10);
    ctx.textAlign = 'center';
    ctx.fillText(`Mixed: ${currentColor}`, cx, cy + 48);
    ctx.fillText(`Goal: #8000FF`, cx, cy + 62);
    ctx.restore();
  }

  private renderSwitch(sw: PuzzleSwitchData) {
    const ctx = this.ctx;
    ctx.save();

    const isOne = sw.value === 1;

    // Chassis background
    ctx.fillStyle = isOne ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.9)';
    ctx.fillRect(sw.x, sw.y, sw.width, sw.height);

    // Chassis border with active glow
    ctx.strokeStyle = isOne ? '#10b981' : 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = isOne ? 2 : 1;
    ctx.strokeRect(sw.x, sw.y, sw.width, sw.height);

    // Top small label (e.g. "Bit 3" or "In A")
    ctx.fillStyle = '#94a3b8';
    ctx.font = this.font('', 9);
    ctx.textAlign = 'center';
    ctx.fillText(sw.label, sw.x + sw.width / 2, sw.y + 14);

    // Big 0 or 1 digital glyph
    ctx.fillStyle = isOne ? '#10b981' : '#475569';
    ctx.font = this.font('bold ', 20);
    ctx.textAlign = 'center';
    ctx.fillText(isOne ? '1' : '0', sw.x + sw.width / 2, sw.y + 36);

    // Sub-label (e.g. "val: 8")
    if (sw.subLabel) {
      ctx.fillStyle = isOne ? '#a7f3d0' : '#64748b';
      ctx.font = this.font('', 8);
      ctx.fillText(sw.subLabel, sw.x + sw.width / 2, sw.y + sw.height - 6);
    }

    // Indicator LED dot at top right
    ctx.fillStyle = isOne ? '#10b981' : '#334155';
    ctx.beginPath();
    ctx.arc(sw.x + sw.width - 8, sw.y + 8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderDial(dial: PuzzleDialData) {
    const ctx = this.ctx;
    ctx.save();

    // Chassis
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.fillRect(dial.x, dial.y, dial.width, dial.height);
    ctx.strokeStyle = dial.color || '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(dial.x, dial.y, dial.width, dial.height);

    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = this.font('', 9);
    ctx.textAlign = 'center';
    ctx.fillText(dial.label, dial.x + dial.width / 2, dial.y + 14);

    // Dial Value
    let strVal = '';
    if (dial.format === 'hex') {
      strVal = '0x' + dial.value.toString(16).toUpperCase();
    } else if (dial.format === 'byte-hex') {
      strVal = '0x' + dial.value.toString(16).padStart(2, '0').toUpperCase();
    } else {
      strVal = dial.value.toString();
    }

    ctx.fillStyle = dial.color || '#38bdf8';
    ctx.font = this.font('bold ', 18);
    ctx.fillText(strVal, dial.x + dial.width / 2, dial.y + 36);

    // SubLabel or hint
    if (dial.subLabel) {
      ctx.fillStyle = '#64748b';
      ctx.font = this.font('', 8);
      ctx.fillText(dial.subLabel, dial.x + dial.width / 2, dial.y + dial.height - 6);
    }

    // Up / Down arrows
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = this.font('', 10).replace('"JetBrains Mono", ', '');
    ctx.fillText('▲', dial.x + dial.width - 12, dial.y + 18);
    ctx.fillText('▼', dial.x + dial.width - 12, dial.y + dial.height - 10);

    ctx.restore();
  }

  private renderPlayer() {
    const ctx = this.ctx;
    const p = this.player;
    ctx.save();

    const facing = p.facing;
    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;

    // Player Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, p.y + p.height, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (Cyan/Navy Cyber Suit)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(p.x + 3, p.y + 12, p.width - 6, p.height - 22);

    // Head / Cyber Helmet
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, p.y + 12, 11, 0, Math.PI * 2);
    ctx.fill();

    // Visor (Glowing Neon Green/Cyan)
    ctx.fillStyle = '#10b981';
    const visorX = facing === 1 ? cx + 1 : cx - 9;
    ctx.fillRect(visorX, p.y + 9, 8, 4);

    // Legs / Walking Frame
    ctx.fillStyle = '#0f172a';
    const legOffset = p.isGrounded && Math.abs(p.vx) > 0.2 ? Math.sin(p.walkTimer * 1.5) * 4 : 0;
    ctx.fillRect(p.x + 5, p.y + p.height - 10, 6, 10 + legOffset);
    ctx.fillRect(p.x + p.width - 11, p.y + p.height - 10, 6, 10 - legOffset);

    // Antenna LED
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx - 1, p.y - 2, 2, 4);
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(cx, p.y - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderProximityPrompts() {
    const ctx = this.ctx;
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;

    ctx.save();

    // 1. Check near switches
    for (const sw of this.currentSwitches) {
      const dist = Math.hypot(px - (sw.x + sw.width / 2), py - (sw.y + sw.height / 2));
      if (dist < 64) {
        this.drawFloatingBadge('[E] Toggle Bit', sw.x + sw.width / 2, sw.y - 14, '#10b981');
        break;
      }
    }

    // 2. Check near dials
    for (const dial of this.currentDials) {
      const dist = Math.hypot(px - (dial.x + dial.width / 2), py - (dial.y + dial.height / 2));
      if (dist < 72) {
        this.drawFloatingBadge('[E] Dial (+1)', dial.x + dial.width / 2, dial.y - 14, '#38bdf8');
        break;
      }
    }

    // 3. Check near exit gate
    const gate = this.currentLevel.exitGate;
    const gDist = Math.hypot(px - (gate.x + gate.width / 2), py - (gate.y + gate.height / 2));
    if (gDist < 80 && this.currentEvaluation.isSolved) {
      this.drawFloatingBadge('[E] Enter Portal', gate.x + gate.width / 2, gate.y - 24, '#10b981');
    }

    ctx.restore();
  }

  private drawFloatingBadge(text: string, x: number, y: number, color: string) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = this.font('bold ', 10);
    const textWidth = ctx.measureText(text).width;
    const pad = 6;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(x - textWidth / 2 - pad, y - 10, textWidth + pad * 2, 16);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - textWidth / 2 - pad, y - 10, textWidth + pad * 2, 16);

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 2);
    ctx.restore();
  }

  private renderFX() {
    const ctx = this.ctx;
    ctx.save();

    // Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating Texts
    ctx.font = this.font('bold ', 12);
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();
  }

  // FX Helpers
  public addFloatingText(text: string, x: number, y: number, color: string = '#ffffff') {
    this.floatingTexts.push({
      id: `ft-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      vy: -1.2,
      alpha: 1,
      color
    });
  }

  private spawnJumpParticles(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 1.5,
        size: 2 + Math.random() * 2,
        color: '#38bdf8',
        alpha: 0.8,
        decay: 0.04
      });
    }
  }

  private spawnSwitchSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 2 + Math.random() * 2,
        color,
        alpha: 0.9,
        decay: 0.05
      });
    }
  }

  private spawnLaserSparks(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x,
        y,
        vx: -1 - Math.random() * 3,
        vy: (Math.random() - 0.5) * 3,
        size: 2,
        color: '#ef4444',
        alpha: 0.9,
        decay: 0.06
      });
    }
  }

  private spawnGateCelebrationSparks() {
    const gate = this.currentLevel.exitGate;
    const cx = gate.x + gate.width / 2;
    const cy = gate.y + gate.height / 2;
    const colors = ['#10b981', '#38bdf8', '#fbbf24', '#c084fc'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.02
      });
    }
  }
}
