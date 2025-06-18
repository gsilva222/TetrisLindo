// Configuração do jogo Tetris usando Phaser 3
class TetrisGame extends Phaser.Scene {
    constructor() {
        super({ key: 'TetrisGame' });
        
        // Configurações do jogo
        this.GRID_WIDTH = 10;
        this.GRID_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        this.COLORS = [
            0x000000, // vazio
            0xFF0000, // I - vermelho
            0x00FF00, // O - verde
            0x0000FF, // T - azul
            0xFFFF00, // S - amarelo
            0xFF00FF, // Z - magenta
            0x00FFFF, // J - ciano
            0xFFA500  // L - laranja
        ];
        
        // Formas das peças do Tetris
        this.TETROMINOES = {
            I: [
                [1,1,1,1]
            ],
            O: [
                [2,2],
                [2,2]
            ],
            T: [
                [0,3,0],
                [3,3,3]
            ],
            S: [
                [0,4,4],
                [4,4,0]
            ],
            Z: [
                [5,5,0],
                [0,5,5]
            ],
            J: [
                [6,0,0],
                [6,6,6]
            ],
            L: [
                [0,0,7],
                [7,7,7]
            ]
        };
        
        this.grid = [];
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropTimer = 0;
        this.dropInterval = 500; // milissegundos
        this.gameOver = false;
        
        this.blocks = [];
        this.graphics = null;
    }
    
    preload() {
        // Criar texturas de blocos coloridos
        this.load.image('background', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }
    
    create() {
        // Inicializar grid
        this.initializeGrid();
        
        // Criar gráficos
        this.graphics = this.add.graphics();
        
        // Criar interface
        this.createUI();
        
        // Configurar controles
        this.setupControls();
        
        // Spawnar primeira peça
        this.spawnNewPiece();
        
        // Iniciar loop do jogo
        this.time.addEvent({
            delay: this.dropInterval,
            callback: this.dropPiece,
            callbackScope: this,
            loop: true
        });
    }
    
    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                this.grid[y][x] = 0;
            }
        }
    }
    
    createUI() {
        // Título
        this.add.text(400, 50, 'TETRIS LINDO', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Score
        this.scoreText = this.add.text(400, 100, `Score: ${this.score}`, {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Lines
        this.linesText = this.add.text(400, 130, `Lines: ${this.lines}`, {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Level
        this.levelText = this.add.text(400, 160, `Level: ${this.level}`, {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Game Over text (inicialmente oculto)
        this.gameOverText = this.add.text(400, 300, 'GAME OVER\nPress R to Restart', {
            fontSize: '24px',
            fill: '#ff0000',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setVisible(false);
    }
    
    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        
        // Prevenir repetição muito rápida das teclas        this.input.keyboard.on('keydown-LEFT', () => {
            if (!this.gameOver && this.movePiece(-1, 0)) {
                window.tetrisAudio?.play('move');
            }
        });
        
        this.input.keyboard.on('keydown-RIGHT', () => {
            if (!this.gameOver && this.movePiece(1, 0)) {
                window.tetrisAudio?.play('move');
            }
        });
        
        this.input.keyboard.on('keydown-UP', () => {
            if (!this.gameOver) {
                this.rotatePiece();
                window.tetrisAudio?.play('rotate');
            }
        });
        
        this.input.keyboard.on('keydown-DOWN', () => {
            if (!this.gameOver) this.dropPiece();
        });
        
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.gameOver) this.hardDrop();
        });
        
        this.input.keyboard.on('keydown-R', () => {
            if (this.gameOver) this.restartGame();
        });
    }
    
    spawnNewPiece() {
        const pieces = Object.keys(this.TETROMINOES);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        this.currentPiece = this.TETROMINOES[randomPiece];
        this.currentX = Math.floor(this.GRID_WIDTH / 2) - Math.floor(this.currentPiece[0].length / 2);
        this.currentY = 0;
        
        // Verificar game over
        if (this.checkCollision(this.currentPiece, this.currentX, this.currentY)) {
            this.endGame();
        }
    }
    
    movePiece(dx, dy) {
        if (this.checkCollision(this.currentPiece, this.currentX + dx, this.currentY + dy)) {
            return false;
        }
        
        this.currentX += dx;
        this.currentY += dy;
        return true;
    }
    
    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece);
        if (!this.checkCollision(rotated, this.currentX, this.currentY)) {
            this.currentPiece = rotated;
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];
        
        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = 0; j < rows; j++) {
                rotated[i][j] = matrix[rows - 1 - j][i];
            }
        }
        
        return rotated;
    }
    
    dropPiece() {
        if (!this.movePiece(0, 1)) {
            this.placePiece();
            this.clearLines();
            this.spawnNewPiece();
        }
    }
    
    hardDrop() {
        while (this.movePiece(0, 1)) {
            this.score += 2; // Pontos extras por hard drop
        }
        this.placePiece();
        this.clearLines();
        this.spawnNewPiece();
    }
    
    checkCollision(piece, x, y) {
        for (let py = 0; py < piece.length; py++) {
            for (let px = 0; px < piece[py].length; px++) {
                if (piece[py][px] !== 0) {
                    const newX = x + px;
                    const newY = y + py;
                    
                    if (newX < 0 || newX >= this.GRID_WIDTH || 
                        newY >= this.GRID_HEIGHT || 
                        (newY >= 0 && this.grid[newY][newX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    placePiece() {
        for (let py = 0; py < this.currentPiece.length; py++) {
            for (let px = 0; px < this.currentPiece[py].length; px++) {
                if (this.currentPiece[py][px] !== 0) {
                    const x = this.currentX + px;
                    const y = this.currentY + py;
                    if (y >= 0) {
                        this.grid[y][x] = this.currentPiece[py][px];
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.GRID_HEIGHT - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(new Array(this.GRID_WIDTH).fill(0));
                linesCleared++;
                y++; // Verificar a mesma linha novamente
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += this.calculateScore(linesCleared);
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 500 - (this.level - 1) * 50);
        }
    }
    
    calculateScore(lines) {
        const basePoints = [0, 100, 300, 500, 800];
        return basePoints[lines] * this.level;
    }
    
    endGame() {
        this.gameOver = true;
        this.gameOverText.setVisible(true);
    }
    
    restartGame() {
        this.gameOver = false;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 500;
        this.gameOverText.setVisible(false);
        this.initializeGrid();
        this.spawnNewPiece();
    }
    
    update() {
        if (this.gameOver) return;
        
        // Atualizar textos da UI
        this.scoreText.setText(`Score: ${this.score}`);
        this.linesText.setText(`Lines: ${this.lines}`);
        this.levelText.setText(`Level: ${this.level}`);
        
        // Desenhar o jogo
        this.drawGame();
    }
    
    drawGame() {
        this.graphics.clear();
        
        // Desenhar grid de fundo
        this.graphics.lineStyle(1, 0x333333);
        for (let x = 0; x <= this.GRID_WIDTH; x++) {
            this.graphics.moveTo(50 + x * this.BLOCK_SIZE, 200);
            this.graphics.lineTo(50 + x * this.BLOCK_SIZE, 200 + this.GRID_HEIGHT * this.BLOCK_SIZE);
        }
        for (let y = 0; y <= this.GRID_HEIGHT; y++) {
            this.graphics.moveTo(50, 200 + y * this.BLOCK_SIZE);
            this.graphics.lineTo(50 + this.GRID_WIDTH * this.BLOCK_SIZE, 200 + y * this.BLOCK_SIZE);
        }
        this.graphics.strokePath();
        
        // Desenhar blocos fixos
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                if (this.grid[y][x] !== 0) {
                    this.drawBlock(x, y, this.COLORS[this.grid[y][x]]);
                }
            }
        }
        
        // Desenhar peça atual
        if (this.currentPiece) {
            for (let py = 0; py < this.currentPiece.length; py++) {
                for (let px = 0; px < this.currentPiece[py].length; px++) {
                    if (this.currentPiece[py][px] !== 0) {
                        this.drawBlock(
                            this.currentX + px, 
                            this.currentY + py, 
                            this.COLORS[this.currentPiece[py][px]]
                        );
                    }
                }
            }
        }
    }
    
    drawBlock(x, y, color) {
        const pixelX = 50 + x * this.BLOCK_SIZE;
        const pixelY = 200 + y * this.BLOCK_SIZE;
        
        // Bloco principal
        this.graphics.fillStyle(color);
        this.graphics.fillRect(pixelX + 1, pixelY + 1, this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2);
        
        // Efeito 3D
        this.graphics.fillStyle(Phaser.Display.Color.GetColor32(
            Math.min(255, Phaser.Display.Color.ColorToRGBA(color).r + 40),
            Math.min(255, Phaser.Display.Color.ColorToRGBA(color).g + 40),
            Math.min(255, Phaser.Display.Color.ColorToRGBA(color).b + 40),
            255
        ));
        this.graphics.fillRect(pixelX + 1, pixelY + 1, this.BLOCK_SIZE - 2, 3);
        this.graphics.fillRect(pixelX + 1, pixelY + 1, 3, this.BLOCK_SIZE - 2);
    }
}

// Configuração do Phaser
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    parent: 'game-canvas',
    backgroundColor: '#222222',
    scene: TetrisGame,
    physics: {
        default: 'arcade'
    }
};

// Inicializar jogo
const game = new Phaser.Game(config);
