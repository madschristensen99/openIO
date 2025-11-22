'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Extend CanvasRenderingContext2D to include roundRect
declare global {
  interface CanvasRenderingContext2D {
    roundRect(x: number, y: number, width: number, height: number, radius: number): void;
  }
}

export default function CardEffect() {
  const cardLineRef = useRef<HTMLDivElement>(null);
  const cardStreamRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const scannerCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const animationFrameRef = useRef<number>();
  
  const particleSystemRef = useRef<any>(null);
  const particleScannerRef = useRef<any>(null);
  const cardStreamControllerRef = useRef<any>(null);

  useEffect(() => {
    if (!cardLineRef.current || !cardStreamRef.current) return;

    // Polyfill for roundRect if not available
    if (typeof CanvasRenderingContext2D.prototype.roundRect === 'undefined') {
      CanvasRenderingContext2D.prototype.roundRect = function(
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
      ) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
      };
    }

    // Initialize card stream
    const cardStream = new CardStreamController();
    cardStreamControllerRef.current = cardStream;

    // Initialize particle system
    const particleSystem = new ParticleSystem();
    particleSystemRef.current = particleSystem;

    // Initialize particle scanner
    const particleScanner = new ParticleScanner();
    particleScannerRef.current = particleScanner;

    // Set up global scanner function
    (window as any).setScannerScanning = (active: boolean) => {
      if (particleScanner) {
        particleScanner.setScanningActive(active);
      }
    };

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (particleSystem) {
        particleSystem.destroy();
      }
      if (particleScanner) {
        particleScanner.destroy();
      }
    };
  }, []);

  class CardStreamController {
    container: HTMLDivElement;
    cardLine: HTMLDivElement;
    speedIndicator: HTMLElement | null;
    position: number;
    velocity: number;
    direction: number;
    isAnimating: boolean;
    isDragging: boolean;
    lastTime: number;
    lastMouseX: number;
    mouseVelocity: number;
    friction: number;
    minVelocity: number;
    containerWidth: number;
    cardLineWidth: number;

    constructor() {
      this.container = cardStreamRef.current!;
      this.cardLine = cardLineRef.current!;
      this.speedIndicator = document.getElementById('speedValue');

      this.position = 0;
      this.velocity = 120;
      this.direction = -1;
      this.isAnimating = true;
      this.isDragging = false;

      this.lastTime = 0;
      this.lastMouseX = 0;
      this.mouseVelocity = 0;
      this.friction = 0.95;
      this.minVelocity = 30;

      this.containerWidth = 0;
      this.cardLineWidth = 0;

      this.init();
    }

    init() {
      this.populateCardLine();
      this.calculateDimensions();
      this.setupEventListeners();
      this.updateCardPosition();
      this.animate();
      this.startPeriodicUpdates();
    }

    calculateDimensions() {
      this.containerWidth = this.container.offsetWidth;
      const cardWidth = 400;
      const cardGap = 60;
      const cardCount = this.cardLine.children.length;
      this.cardLineWidth = (cardWidth + cardGap) * cardCount;
    }

    setupEventListeners() {
      this.cardLine.addEventListener('mousedown', (e) => this.startDrag(e));
      document.addEventListener('mousemove', (e) => this.onDrag(e));
      document.addEventListener('mouseup', () => this.endDrag());

      this.cardLine.addEventListener(
        'touchstart',
        (e) => this.startDrag(e.touches[0]),
        { passive: false }
      );
      document.addEventListener('touchmove', (e) => this.onDrag(e.touches[0]), {
        passive: false,
      });
      document.addEventListener('touchend', () => this.endDrag());

      this.cardLine.addEventListener('wheel', (e) => this.onWheel(e));
      this.cardLine.addEventListener('selectstart', (e) => e.preventDefault());
      this.cardLine.addEventListener('dragstart', (e) => e.preventDefault());

      window.addEventListener('resize', () => this.calculateDimensions());
    }

    startDrag(e: MouseEvent | Touch) {
      e.preventDefault();

      this.isDragging = true;
      this.isAnimating = false;
      this.lastMouseX = e.clientX;
      this.mouseVelocity = 0;

      const transform = window.getComputedStyle(this.cardLine).transform;
      if (transform !== 'none') {
        const matrix = new DOMMatrix(transform);
        this.position = matrix.m41;
      }

      this.cardLine.style.animation = 'none';
      this.cardLine.classList.add('dragging');

      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    onDrag(e: MouseEvent | Touch) {
      if (!this.isDragging) return;
      e.preventDefault();

      const deltaX = e.clientX - this.lastMouseX;
      this.position += deltaX;
      this.mouseVelocity = deltaX * 60;
      this.lastMouseX = e.clientX;

      this.cardLine.style.transform = `translateX(${this.position}px)`;
      this.updateCardClipping();
    }

    endDrag() {
      if (!this.isDragging) return;

      this.isDragging = false;
      this.cardLine.classList.remove('dragging');

      if (Math.abs(this.mouseVelocity) > this.minVelocity) {
        this.velocity = Math.abs(this.mouseVelocity);
        this.direction = this.mouseVelocity > 0 ? 1 : -1;
      } else {
        this.velocity = 120;
      }

      this.isAnimating = true;
      this.updateSpeedIndicator();
    }

    animate() {
      const currentTime = performance.now();
      const deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      if (this.isAnimating && !this.isDragging) {
        if (this.velocity > this.minVelocity) {
          this.velocity *= this.friction;
        } else {
          this.velocity = Math.max(this.minVelocity, this.velocity);
        }

        this.position += this.velocity * this.direction * deltaTime;
        this.updateCardPosition();
        this.updateSpeedIndicator();
      }

      animationFrameRef.current = requestAnimationFrame(() => this.animate());
    }

    updateCardPosition() {
      const containerWidth = this.containerWidth;
      const cardLineWidth = this.cardLineWidth;

      if (this.position < -cardLineWidth) {
        this.position = containerWidth;
      } else if (this.position > containerWidth) {
        this.position = -cardLineWidth;
      }

      this.cardLine.style.transform = `translateX(${this.position}px)`;
      this.updateCardClipping();
    }

    updateSpeedIndicator() {
      if (this.speedIndicator) {
        this.speedIndicator.textContent = Math.round(this.velocity).toString();
      }
    }

    toggleAnimation() {
      this.isAnimating = !this.isAnimating;
    }

    resetPosition() {
      this.position = this.containerWidth;
      this.velocity = 120;
      this.direction = -1;
      this.isAnimating = true;
      this.isDragging = false;

      this.cardLine.style.animation = 'none';
      this.cardLine.style.transform = `translateX(${this.position}px)`;
      this.cardLine.classList.remove('dragging');

      this.updateSpeedIndicator();
    }

    changeDirection() {
      this.direction *= -1;
      this.updateSpeedIndicator();
    }

    onWheel(e: WheelEvent) {
      e.preventDefault();

      const scrollSpeed = 20;
      const delta = e.deltaY > 0 ? scrollSpeed : -scrollSpeed;

      this.position += delta;
      this.updateCardPosition();
      this.updateCardClipping();
    }

    generateCode(width: number, height: number) {
      const randInt = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1)) + min;
      const pick = (arr: string[]) => arr[randInt(0, arr.length - 1)];

      const commands = [
        'siphon arbitrage --pair ETH/USDT --min-profit 0.5%',
        'siphon swap --from USDC --to ETH --amount 1000',
        'siphon snipe --token 0x... --amount 5ETH --gas-price 50',
        'siphon protect --tx-hash 0x... --max-slippage 1%',
        'siphon route --path USDC->WETH->DAI --amount 5000',
        'siphon flash --protocol Aave --profit-target 2%',
        'siphon optimize --tx-batch [0x...] --target 20gwei',
        'siphon limit --pair BTC/ETH --price 0.065 --side buy',
        'siphon liquidate --protocol Compound --min-profit 5%',
        'siphon monitor --address 0x... --events Transfer,Swap',
      ];

      const codeBlocks = [
        'async function executeArbitrage() {',
        '  const priceDiff = await getPriceDifference();',
        '  if (priceDiff > minProfit) {',
        '    await executeSwap();',
        '  }',
        '}',
        '',
        'function calculateGasCost(tx) {',
        '  return tx.gasLimit * tx.gasPrice;',
        '}',
        '',
        'const router = new UniswapV3Router();',
        'const slippage = 0.003;',
        'const deadline = Date.now() + 1200000;',
        '',
        'async function findBestRoute(from, to, amount) {',
        '  const routes = await getAvailableRoutes();',
        '  return routes.sort((a, b) => b.output - a.output)[0];',
        '}',
        '',
        'function validateTransaction(tx) {',
        '  if (tx.value > maxAmount) return false;',
        '  if (tx.gasPrice > maxGasPrice) return false;',
        '  return true;',
        '}',
        '',
        'const strategies = {',
        '  arbitrage: { minProfit: 0.005, timeout: 30000 },',
        '  liquidation: { healthFactor: 1.0, gasLimit: 300000 },',
        '  sniping: { priority: "high", retries: 3 }',
        '};',
        '',
        'function monitorPool(address) {',
        '  const filter = { address, topics: [SWAP_TOPIC] };',
        '  provider.on(filter, handleSwap);',
        '}',
        '',
        'async function executeFlashLoan(amount, callback) {',
        '  const loan = await aave.flashLoan(amount);',
        '  await callback(loan);',
        '  await aave.repay(loan);',
        '}',
      ];

      const library: string[] = [];
      commands.forEach((cmd) => library.push(cmd));
      codeBlocks.forEach((block) => library.push(block));

      for (let i = 0; i < 30; i++) {
        const cmd = pick(commands);
        library.push(cmd);
      }

      for (let i = 0; i < 20; i++) {
        const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'WETH'];
        const token = pick(tokens);
        library.push(`const ${token.toLowerCase()}Price = await getPrice("${token}");`);
      }

      let flow = library.join(' ');
      flow = flow.replace(/\s+/g, ' ').trim();
      const totalChars = width * height;
      while (flow.length < totalChars + width) {
        const extra = pick(library).replace(/\s+/g, ' ').trim();
        flow += ' ' + extra;
      }

      let out = '';
      let offset = 0;
      for (let row = 0; row < height; row++) {
        let line = flow.slice(offset, offset + width);
        if (line.length < width) line = line + ' '.repeat(width - line.length);
        out += line + (row < height - 1 ? '\n' : '');
        offset += width;
      }
      return out;
    }

    calculateCodeDimensions(cardWidth: number, cardHeight: number) {
      const fontSize = 11;
      const lineHeight = 13;
      const charWidth = 6;
      const width = Math.floor(cardWidth / charWidth);
      const height = Math.floor(cardHeight / lineHeight);
      return { width, height, fontSize, lineHeight };
    }

    getCardData(index: number) {
      const strategies = [
        {
          type: 'strategy',
          title: 'Arbitrage Bot',
          command: 'siphon arbitrage --pair ETH/USDT --min-profit 0.5%',
          description: 'Auto-detect price differences across DEXs',
          params: { gasLimit: '150000', slippage: '0.3%', timeout: '30s' },
          color: '#00d4ff',
        },
        {
          type: 'swap',
          title: 'Token Swap',
          command: 'siphon swap --from USDC --to ETH --amount 1000',
          description: 'Execute token swap with optimal routing',
          params: { route: 'Uniswap V3', fee: '0.05%', deadline: '20m' },
          color: '#00ff88',
        },
        {
          type: 'strategy',
          title: 'Liquidity Sniping',
          command: 'siphon snipe --token 0x... --amount 5ETH --gas-price 50',
          description: 'Front-run new liquidity pools',
          params: { priority: 'high', maxGas: '500000', retries: '3' },
          color: '#ff6b6b',
        },
        {
          type: 'command',
          title: 'MEV Protection',
          command: 'siphon protect --tx-hash 0x... --max-slippage 1%',
          description: 'Protect transactions from MEV attacks',
          params: { method: 'private-pool', cost: '0.01ETH', delay: '0ms' },
          color: '#ffd93d',
        },
        {
          type: 'swap',
          title: 'Multi-Hop Swap',
          command: 'siphon route --path USDC->WETH->DAI --amount 5000',
          description: 'Multi-hop routing for better rates',
          params: { hops: '3', gasEstimate: '250000', minOut: '4950' },
          color: '#6bcf7f',
        },
        {
          type: 'strategy',
          title: 'Flash Loan Arbitrage',
          command: 'siphon flash --protocol Aave --profit-target 2%',
          description: 'Execute arbitrage using flash loans',
          params: { protocol: 'Aave V3', collateral: 'none', fee: '0.09%' },
          color: '#a78bfa',
        },
        {
          type: 'command',
          title: 'Gas Optimization',
          command: 'siphon optimize --tx-batch [0x...] --target 20gwei',
          description: 'Optimize gas usage across transactions',
          params: { savings: '15%', method: 'batching', delay: '5s' },
          color: '#fb7185',
        },
        {
          type: 'swap',
          title: 'Limit Order',
          command: 'siphon limit --pair BTC/ETH --price 0.065 --side buy',
          description: 'Place limit order on DEX',
          params: { expiry: '24h', fillType: 'partial', fee: '0.1%' },
          color: '#34d399',
        },
        {
          type: 'strategy',
          title: 'Liquidation Bot',
          command: 'siphon liquidate --protocol Compound --min-profit 5%',
          description: 'Auto-liquidate undercollateralized positions',
          params: { healthFactor: '<1.0', gasLimit: '300000', priority: 'high' },
          color: '#f87171',
        },
        {
          type: 'command',
          title: 'Transaction Monitoring',
          command: 'siphon monitor --address 0x... --events Transfer,Swap',
          description: 'Monitor on-chain events in real-time',
          params: { interval: '1s', alerts: 'webhook', history: '7d' },
          color: '#60a5fa',
        },
      ];

      return strategies[index % strategies.length];
    }

    createCardWrapper(index: number) {
      const wrapper = document.createElement('div');
      wrapper.className = 'card-wrapper';

      const normalCard = document.createElement('div');
      normalCard.className = 'card card-normal';

      const cardData = this.getCardData(index);

      // Create card content container
      const cardContent = document.createElement('div');
      cardContent.className = 'card-content';

      // Card header with type badge
      const cardHeader = document.createElement('div');
      cardHeader.className = 'card-header';
      
      const typeBadge = document.createElement('span');
      typeBadge.className = `card-type-badge card-type-${cardData.type}`;
      typeBadge.textContent = cardData.type.toUpperCase();
      
      const cardTitle = document.createElement('h3');
      cardTitle.className = 'card-title';
      cardTitle.textContent = cardData.title;

      cardHeader.appendChild(typeBadge);
      cardHeader.appendChild(cardTitle);

      // Command section
      const commandSection = document.createElement('div');
      commandSection.className = 'card-command';
      const commandCode = document.createElement('code');
      commandCode.className = 'command-code';
      commandCode.textContent = cardData.command;
      commandSection.appendChild(commandCode);

      // Description
      const description = document.createElement('p');
      description.className = 'card-description';
      description.textContent = cardData.description;

      // Parameters
      const paramsSection = document.createElement('div');
      paramsSection.className = 'card-params';
      Object.entries(cardData.params).forEach(([key, value]) => {
        const param = document.createElement('div');
        param.className = 'card-param';
        const paramKey = document.createElement('span');
        paramKey.className = 'param-key';
        paramKey.textContent = key + ':';
        const paramValue = document.createElement('span');
        paramValue.className = 'param-value';
        paramValue.textContent = String(value);
        param.appendChild(paramKey);
        param.appendChild(paramValue);
        paramsSection.appendChild(param);
      });

      cardContent.appendChild(cardHeader);
      cardContent.appendChild(commandSection);
      cardContent.appendChild(description);
      cardContent.appendChild(paramsSection);

      // Set card color
      normalCard.style.setProperty('--card-color', cardData.color);
      normalCard.appendChild(cardContent);

      const asciiCard = document.createElement('div');
      asciiCard.className = 'card card-ascii';

      const asciiContent = document.createElement('div');
      asciiContent.className = 'ascii-content';

      const { width, height, fontSize, lineHeight } =
        this.calculateCodeDimensions(400, 250);
      asciiContent.style.fontSize = fontSize + 'px';
      asciiContent.style.lineHeight = lineHeight + 'px';
      asciiContent.textContent = this.generateCode(width, height);

      asciiCard.appendChild(asciiContent);
      wrapper.appendChild(normalCard);
      wrapper.appendChild(asciiCard);

      return wrapper;
    }

    updateCardClipping() {
      const scannerX = window.innerWidth / 2 + 10;
      const scannerWidth = 10;
      const scannerLeft = scannerX - scannerWidth / 2;
      const scannerRight = scannerX + scannerWidth / 2;
      let anyScanningActive = false;

      document.querySelectorAll('.card-wrapper').forEach((wrapper) => {
        const rect = (wrapper as HTMLElement).getBoundingClientRect();
        const cardLeft = rect.left;
        const cardRight = rect.right;
        const cardWidth = rect.width;

        const normalCard = wrapper.querySelector('.card-normal') as HTMLElement;
        const asciiCard = wrapper.querySelector('.card-ascii') as HTMLElement;

        if (cardLeft < scannerRight && cardRight > scannerLeft) {
          anyScanningActive = true;
          const scannerIntersectLeft = Math.max(scannerLeft - cardLeft, 0);
          const scannerIntersectRight = Math.min(
            scannerRight - cardLeft,
            cardWidth
          );

          const normalClipRight = (scannerIntersectLeft / cardWidth) * 100;
          const asciiClipLeft = (scannerIntersectRight / cardWidth) * 100;

          normalCard.style.setProperty('--clip-right', `${normalClipRight}%`);
          asciiCard.style.setProperty('--clip-left', `${asciiClipLeft}%`);

          if (!wrapper.hasAttribute('data-scanned') && scannerIntersectLeft > 0) {
            wrapper.setAttribute('data-scanned', 'true');
            const scanEffect = document.createElement('div');
            scanEffect.className = 'scan-effect';
            wrapper.appendChild(scanEffect);
            setTimeout(() => {
              if (scanEffect.parentNode) {
                scanEffect.parentNode.removeChild(scanEffect);
              }
            }, 600);
          }
        } else {
          if (cardRight < scannerLeft) {
            normalCard.style.setProperty('--clip-right', '100%');
            asciiCard.style.setProperty('--clip-left', '100%');
          } else if (cardLeft > scannerRight) {
            normalCard.style.setProperty('--clip-right', '0%');
            asciiCard.style.setProperty('--clip-left', '0%');
          }
          wrapper.removeAttribute('data-scanned');
        }
      });

      if ((window as any).setScannerScanning) {
        (window as any).setScannerScanning(anyScanningActive);
      }
    }

    updateAsciiContent() {
      document.querySelectorAll('.ascii-content').forEach((content) => {
        if (Math.random() < 0.15) {
          const { width, height } = this.calculateCodeDimensions(400, 250);
          (content as HTMLElement).textContent = this.generateCode(width, height);
        }
      });
    }

    populateCardLine() {
      if (!this.cardLine) return;
      this.cardLine.innerHTML = '';
      const cardsCount = 30;
      for (let i = 0; i < cardsCount; i++) {
        const cardWrapper = this.createCardWrapper(i);
        this.cardLine.appendChild(cardWrapper);
      }
    }

    startPeriodicUpdates() {
      setInterval(() => {
        this.updateAsciiContent();
      }, 200);

      const updateClipping = () => {
        this.updateCardClipping();
        requestAnimationFrame(updateClipping);
      };
      updateClipping();
    }
  }

  class ParticleSystem {
    scene: THREE.Scene | null = null;
    camera: THREE.OrthographicCamera | null = null;
    renderer: THREE.WebGLRenderer | null = null;
    particles: THREE.Points | null = null;
    particleCount = 400;
    canvas: HTMLCanvasElement | null = null;
    velocities: Float32Array | null = null;
    alphas: Float32Array | null = null;
    animationFrameId: number | null = null;

    constructor() {
      this.canvas = particleCanvasRef.current;
      if (!this.canvas) return;
      this.init();
    }

    init() {
      if (!this.canvas) return;

      this.scene = new THREE.Scene();

      this.camera = new THREE.OrthographicCamera(
        -window.innerWidth / 2,
        window.innerWidth / 2,
        125,
        -125,
        1,
        1000
      );
      this.camera.position.z = 100;

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
      });
      this.renderer.setSize(window.innerWidth, 250);
      this.renderer.setClearColor(0x000000, 0);

      this.createParticles();

      this.animate();

      window.addEventListener('resize', () => this.onWindowResize());
    }

    createParticles() {
      if (!this.scene) return;

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(this.particleCount * 3);
      const colors = new Float32Array(this.particleCount * 3);
      const sizes = new Float32Array(this.particleCount);
      const velocities = new Float32Array(this.particleCount);

      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');

      const half = canvas.width / 2;
      const hue = 217;

      const gradient = ctx!.createRadialGradient(half, half, 0, half, half, half);
      gradient.addColorStop(0.025, '#fff');
      gradient.addColorStop(0.1, `hsl(${hue}, 61%, 33%)`);
      gradient.addColorStop(0.25, `hsl(${hue}, 64%, 6%)`);
      gradient.addColorStop(1, 'transparent');

      ctx!.fillStyle = gradient;
      ctx!.beginPath();
      ctx!.arc(half, half, half, 0, Math.PI * 2);
      ctx!.fill();

      const texture = new THREE.CanvasTexture(canvas);

      for (let i = 0; i < this.particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
        positions[i * 3 + 2] = 0;

        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;

        const orbitRadius = Math.random() * 200 + 100;
        sizes[i] = (Math.random() * (orbitRadius - 60) + 60) / 8;

        velocities[i] = Math.random() * 60 + 30;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      this.velocities = velocities;

      const alphas = new Float32Array(this.particleCount);
      for (let i = 0; i < this.particleCount; i++) {
        alphas[i] = (Math.random() * 8 + 2) / 10;
      }
      geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
      this.alphas = alphas;

      const material = new THREE.ShaderMaterial({
        uniforms: {
          pointTexture: { value: texture },
          size: { value: 15.0 },
        },
        vertexShader: `
          attribute float alpha;
          varying float vAlpha;
          varying vec3 vColor;
          uniform float size;
          
          void main() {
            vAlpha = alpha;
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D pointTexture;
          varying float vAlpha;
          varying vec3 vColor;
          
          void main() {
            gl_FragColor = vec4(vColor, vAlpha) * texture2D(pointTexture, gl_PointCoord);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
      });

      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);
    }

    animate() {
      if (!this.renderer || !this.scene || !this.camera || !this.particles) return;

      this.animationFrameId = requestAnimationFrame(() => this.animate());

      const positions = this.particles.geometry.attributes.position.array as Float32Array;
      const alphas = this.particles.geometry.attributes.alpha.array as Float32Array;
      const time = Date.now() * 0.001;

      for (let i = 0; i < this.particleCount; i++) {
        positions[i * 3] += this.velocities![i] * 0.016;

        if (positions[i * 3] > window.innerWidth / 2 + 100) {
          positions[i * 3] = -window.innerWidth / 2 - 100;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
        }

        positions[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.5;

        const twinkle = Math.floor(Math.random() * 10);
        if (twinkle === 1 && alphas[i] > 0) {
          alphas[i] -= 0.05;
        } else if (twinkle === 2 && alphas[i] < 1) {
          alphas[i] += 0.05;
        }

        alphas[i] = Math.max(0, Math.min(1, alphas[i]));
      }

      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.geometry.attributes.alpha.needsUpdate = true;

      this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
      if (!this.camera || !this.renderer) return;

      this.camera.left = -window.innerWidth / 2;
      this.camera.right = window.innerWidth / 2;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, 250);
    }

    destroy() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      if (this.renderer) {
        this.renderer.dispose();
      }
      if (this.particles) {
        this.scene?.remove(this.particles);
        this.particles.geometry.dispose();
        (this.particles.material as THREE.ShaderMaterial).dispose();
      }
    }
  }


}

