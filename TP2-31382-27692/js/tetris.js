// Sistema de High Scores
class HighScoreManager {
  static currentBestScore = 0; // Variável para guardar o melhor score atual

  static getHighScores() {
    const scores = localStorage.getItem("tetris-highscores");
    return scores ? JSON.parse(scores) : [];
  }

  static addHighScore(name, score) {
    const highScores = this.getHighScores();
    highScores.push({ name, score, date: new Date().toLocaleDateString() });
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(10); // Manter apenas top 10
    localStorage.setItem("tetris-highscores", JSON.stringify(highScores));

    // Atualizar melhor score atual
    this.updateBestScore();
  }
  static updateBestScore() {
    const highScores = this.getHighScores();
    this.currentBestScore = highScores.length > 0 ? highScores[0].score : 0;
  }
  static isHighScore(score) {
    // Scores muito baixos não contam
    if (score < 100) {
      return false;
    }

    // Atualizar o melhor score atual
    this.updateBestScore();

    const highScores = this.getHighScores();

    // REGRA RIGOROSA: Só é high score se:
    // 1. Score >= 100 (mínimo)
    // 2. E (há menos de 10 scores OU score > menor score existente)
    // 3. E score > 0

    if (highScores.length === 0) {
      // Primeiro score - aceita se >= 100
      return true;
    }

    if (highScores.length < 10) {
      // Há espaço na lista - aceita se >= 100 e > que o menor existente
      const lowestExisting = highScores[highScores.length - 1].score;
      return score > lowestExisting;
    }

    // Lista cheia (10 scores) - só aceita se for maior que o menor
    const lowestScore = highScores[9].score; // Último da lista (menor)
    return score > lowestScore;
  }
  static isNameTaken(name) {
    const highScores = this.getHighScores();
    return highScores.some(
      (score) => score.name.toLowerCase() === name.toLowerCase()
    );
  }
  static clearAllHighScores() {
    localStorage.removeItem("tetris-highscores");

    // Atualizar melhor score atual (agora será 0)
    this.updateBestScore();
  }

  static getTopScore() {
    const highScores = this.getHighScores();
    return highScores.length > 0 ? highScores[0].score : 0;
  }
}

// Cena do Menu Principal
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    console.log("MenuScene created");

    // Fundo
    this.add.rectangle(400, 400, 800, 800, 0x1a1a2e);

    // Título principal
    this.add
      .text(400, 200, "TETRIS", {
        fontSize: "72px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5); // Melhor Score
    const topScore = HighScoreManager.getTopScore();
    if (topScore > 0) {
      this.add
        .text(400, 280, `Melhor Pontuação: ${topScore}`, {
          fontSize: "16px",
          fill: "#ffff00",
        })
        .setOrigin(0.5);
    }

    // Botão Play
    const playButton = this.add.rectangle(400, 350, 200, 80, 0x4a90e2);
    playButton.setStrokeStyle(3, 0xffffff);
    playButton.setInteractive();

    const playText = this.add
      .text(400, 350, "JOGAR", {
        fontSize: "32px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Efeitos do botão
    playButton.on("pointerover", () => {
      playButton.setFillStyle(0x5ba0f2);
    });

    playButton.on("pointerout", () => {
      playButton.setFillStyle(0x4a90e2);
    });
    playButton.on("pointerdown", () => {
      console.log("Play button clicked");
      // Parar a cena atual e iniciar uma nova instância do jogo
      this.scene.stop("TetrisGame");
      this.scene.start("TetrisGame");
    }); // Instruções
    this.add
      .text(400, 480, "Controlos:", {
        fontSize: "20px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(400, 510, "← → : Mover peça", {
        fontSize: "16px",
        fill: "#cccccc",
      })
      .setOrigin(0.5);
    this.add
      .text(400, 535, "↓ : Acelerar queda", {
        fontSize: "16px",
        fill: "#cccccc",
      })
      .setOrigin(0.5);

    this.add
      .text(400, 560, "↑ : Rodar peça", {
        fontSize: "16px",
        fill: "#cccccc",
      })
      .setOrigin(0.5);

    this.add
      .text(400, 585, "ESPAÇO : Queda instantânea", {
        fontSize: "16px",
        fill: "#cccccc",
      })
      .setOrigin(0.5); // High Scores
    this.createScoreboard();

    // Botão secreto para limpar scores (canto inferior direito)
    this.createSecretClearButton();
  }
  createScoreboard() {
    // Título High Scores
    this.add
      .text(120, 350, "MELHORES PONTUAÇÕES", {
        fontSize: "16px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Obter high scores
    const highScores = HighScoreManager.getHighScores();

    // Mostrar top 5
    for (let i = 0; i < Math.min(5, highScores.length); i++) {
      const score = highScores[i];
      this.add
        .text(120, 380 + i * 25, `${i + 1}. ${score.name}`, {
          fontSize: "14px",
          fill: "#cccccc",
        })
        .setOrigin(0.5);

      this.add
        .text(120, 395 + i * 25, `${score.score} pts`, {
          fontSize: "12px",
          fill: "#888888",
        })
        .setOrigin(0.5);
    } // Se não há scores
    if (highScores.length === 0) {
      this.add
        .text(120, 380, "Ainda não há pontuações!", {
          fontSize: "14px",
          fill: "#666666",
        })
        .setOrigin(0.5);
    }
  }

  createSecretClearButton() {
    // Botão pequeno e discreto no canto inferior direito
    const clearButton = this.add.rectangle(750, 750, 80, 30, 0x660000);
    clearButton.setStrokeStyle(1, 0x880000);
    clearButton.setInteractive();
    clearButton.setAlpha(0.7); // Semi-transparente

    const clearText = this.add
      .text(750, 750, "LIMPAR", {
        fontSize: "12px",
        fill: "#ffaaaa",
      })
      .setOrigin(0.5);

    // Efeitos hover
    clearButton.on("pointerover", () => {
      clearButton.setAlpha(1);
      clearButton.setFillStyle(0x880000);
      clearText.setStyle({ fill: "#ffffff" });
    });

    clearButton.on("pointerout", () => {
      clearButton.setAlpha(0.7);
      clearButton.setFillStyle(0x660000);
      clearText.setStyle({ fill: "#ffaaaa" });
    });

    // Ação do botão - duplo clique para confirmar
    let clickCount = 0;
    let clickTimer = null;

    clearButton.on("pointerdown", () => {
      clickCount++;

      if (clickCount === 1) {
        clearText.setText("DUPLO\nCLIQUE");
        clearText.setStyle({ fontSize: "10px" });

        // Reset após 2 segundos
        clickTimer = this.time.delayedCall(2000, () => {
          clickCount = 0;
          clearText.setText("LIMPAR");
          clearText.setStyle({ fontSize: "12px" });
        });
      } else if (clickCount === 2) {
        // Limpar scores
        HighScoreManager.clearAllHighScores();
        clearText.setText("LIMPO!");
        clearText.setStyle({ fontSize: "12px", fill: "#00ff00" });

        // Recarregar a cena após 1 segundo
        this.time.delayedCall(1000, () => {
          this.scene.restart();
        });

        if (clickTimer) {
          clickTimer.destroy();
        }
      }
    });
  }
}

// Cena para input de nome do high score
class HighScoreInputScene extends Phaser.Scene {
  constructor() {
    super({ key: "HighScoreInputScene" });
    this.playerName = "";
    this.score = 0;
  }

  init(data) {
    this.score = data.score;
  }

  create() {
    // Fundo
    this.add.rectangle(400, 400, 800, 800, 0x1a1a2e); // Título
    this.add
      .text(400, 200, "NOVA MELHOR PONTUAÇÃO!", {
        fontSize: "42px",
        fill: "#ffff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Score
    this.add
      .text(400, 270, `Pontuação: ${this.score}`, {
        fontSize: "32px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Instrução
    this.add
      .text(400, 350, "Digite o seu nome:", {
        fontSize: "24px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Campo de texto visual
    this.nameBox = this.add.rectangle(400, 400, 300, 50, 0x333333);
    this.nameBox.setStrokeStyle(2, 0xffffff);
    this.nameText = this.add
      .text(400, 400, "", {
        fontSize: "20px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Texto de erro (inicialmente oculto)
    this.errorText = this.add
      .text(400, 440, "", {
        fontSize: "14px",
        fill: "#ff0000",
      })
      .setOrigin(0.5);

    // Instruções
    this.add
      .text(400, 480, "Prima ENTER para confirmar", {
        fontSize: "16px",
        fill: "#cccccc",
      })
      .setOrigin(0.5);

    this.add
      .text(400, 500, "ESC para cancelar", {
        fontSize: "16px",
        fill: "#cccccc",
      })
      .setOrigin(0.5);

    // Configurar input de teclado
    this.setupKeyboard();
  }
  setupKeyboard() {
    this.input.keyboard.on("keydown", (event) => {
      if (event.keyCode === 8) {
        // Backspace
        this.playerName = this.playerName.slice(0, -1);
        this.errorText.setText(""); // Limpar erro
      } else if (event.keyCode === 13) {
        // Enter
        if (this.playerName.trim().length > 0) {
          if (HighScoreManager.isNameTaken(this.playerName.trim())) {
            this.errorText.setText("Nome já existe! Escolha outro nome.");
            return;
          }
          this.submitScore();
        }
      } else if (event.keyCode === 27) {
        // ESC
        this.scene.start("MenuScene");
      } else if (event.key.length === 1 && this.playerName.length < 15) {
        // Apenas letras, números e alguns símbolos
        if (event.key.match(/[a-zA-Z0-9 ]/)) {
          this.playerName += event.key.toUpperCase();
          this.errorText.setText(""); // Limpar erro ao digitar
        }
      }

      this.nameText.setText(this.playerName);
    });
  }
  submitScore() {
    const trimmedName = this.playerName.trim();

    if (trimmedName.length === 0) {
      this.errorText.setText("Nome não pode estar vazio!");
      return;
    }

    if (HighScoreManager.isNameTaken(trimmedName)) {
      this.errorText.setText("Nome já existe! Escolha outro nome.");
      return;
    }

    HighScoreManager.addHighScore(trimmedName, this.score);
    this.scene.start("MenuScene");
  }
}

// Cena do Jogo Tetris
class TetrisGame extends Phaser.Scene {
  constructor() {
    super({ key: "TetrisGame" });

    this.GRID_WIDTH = 10;
    this.GRID_HEIGHT = 20;
    this.BLOCK_SIZE = 30;
    this.COLORS = [
      0x000000, // vazio
      0xff0000, // I - vermelho
      0x00ff00, // O - verde
      0x0000ff, // T - azul
      0xffff00, // S - amarelo
      0xff00ff, // Z - magenta
      0x00ffff, // J - ciano
      0xffa500, // L - laranja
    ];

    this.TETROMINOES = {
      I: [[1, 1, 1, 1]],
      O: [
        [2, 2],
        [2, 2],
      ],
      T: [
        [0, 3, 0],
        [3, 3, 3],
      ],
      S: [
        [0, 4, 4],
        [4, 4, 0],
      ],
      Z: [
        [5, 5, 0],
        [0, 5, 5],
      ],
      J: [
        [6, 0, 0],
        [6, 6, 6],
      ],
      L: [
        [0, 0, 7],
        [7, 7, 7],
      ],
    };

    this.grid = [];
    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropInterval = 500;
    this.gameOver = false;
    this.lastDropTime = 0;
  }
  create() {
    console.log("TetrisGame created");

    // Resetar todas as variáveis do jogo
    this.gameOver = false;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropInterval = 500;
    this.lastDropTime = 0;
    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;

    this.initializeGrid();
    this.graphics = this.add.graphics();
    this.createUI();
    this.setupControls();
    this.spawnNewPiece();
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
    this.add
      .text(400, 50, "TETRIS LINDO", {
        fontSize: "32px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.scoreText = this.add
      .text(400, 100, `Pontuação: ${this.score}`, {
        fontSize: "20px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    this.linesText = this.add
      .text(400, 130, `Linhas: ${this.lines}`, {
        fontSize: "20px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
    this.levelText = this.add
      .text(400, 160, `Nível: ${this.level}`, {
        fontSize: "20px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
    this.gameOverText = this.add
      .text(
        400,
        300,
        "FIM DE JOGO\nPrima R para Reiniciar\nPrima M para Menu",
        {
          fontSize: "24px",
          fill: "#ff0000",
          fontStyle: "bold",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setVisible(false);

    // Botão Menu
    const menuButton = this.add.rectangle(700, 50, 80, 40, 0x333333);
    menuButton.setStrokeStyle(2, 0xffffff);
    menuButton.setInteractive();

    const menuText = this.add
      .text(700, 50, "MENU", {
        fontSize: "16px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    menuButton.on("pointerover", () => {
      menuButton.setFillStyle(0x555555);
    });

    menuButton.on("pointerout", () => {
      menuButton.setFillStyle(0x333333);
    });

    menuButton.on("pointerup", () => {
      this.scene.start("MenuScene");
    });
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    this.input.keyboard.on("keydown-LEFT", () => {
      if (!this.gameOver) this.movePiece(-1, 0);
    });

    this.input.keyboard.on("keydown-RIGHT", () => {
      if (!this.gameOver) this.movePiece(1, 0);
    });

    this.input.keyboard.on("keydown-UP", () => {
      if (!this.gameOver) this.rotatePiece();
    });

    this.input.keyboard.on("keydown-DOWN", () => {
      if (!this.gameOver) this.dropPiece();
    });

    this.input.keyboard.on("keydown-SPACE", () => {
      if (!this.gameOver) this.hardDrop();
    });

    this.input.keyboard.on("keydown-R", () => {
      if (this.gameOver) this.restartGame();
    });

    this.input.keyboard.on("keydown-M", () => {
      this.scene.start("MenuScene");
    });
  }

  spawnNewPiece() {
    const pieces = Object.keys(this.TETROMINOES);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    this.currentPiece = this.TETROMINOES[randomPiece];
    this.currentX =
      Math.floor(this.GRID_WIDTH / 2) -
      Math.floor(this.currentPiece[0].length / 2);
    this.currentY = 0;

    if (this.checkCollision(this.currentPiece, this.currentX, this.currentY)) {
      this.endGame();
    }
  }

  movePiece(dx, dy) {
    if (
      this.checkCollision(
        this.currentPiece,
        this.currentX + dx,
        this.currentY + dy
      )
    ) {
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
      this.score += 2;
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

          if (
            newX < 0 ||
            newX >= this.GRID_WIDTH ||
            newY >= this.GRID_HEIGHT ||
            (newY >= 0 && this.grid[newY][newX] !== 0)
          ) {
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
      if (this.grid[y].every((cell) => cell !== 0)) {
        this.grid.splice(y, 1);
        this.grid.unshift(new Array(this.GRID_WIDTH).fill(0));
        linesCleared++;
        y++;
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
    this.gameOver = true; // Validação rigorosa: score deve ser >= 100 E ser realmente um high score
    const isValidHighScore =
      this.score >= 100 && HighScoreManager.isHighScore(this.score);

    // Verificar se é high score
    if (isValidHighScore) {
      // É um novo high score! Ir para tela de input de nome
      this.scene.start("HighScoreInputScene", { score: this.score });
    } else {
      // Game over normal
      this.gameOverText.setVisible(true);
    }
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

  update(time) {
    if (this.gameOver) return;

    if (time - this.lastDropTime > this.dropInterval) {
      this.dropPiece();
      this.lastDropTime = time;
    }
    this.scoreText.setText(`Pontuação: ${this.score}`);
    this.linesText.setText(`Linhas: ${this.lines}`);
    this.levelText.setText(`Nível: ${this.level}`);

    this.drawGame();
  }

  drawGame() {
    this.graphics.clear();

    // Grid de fundo
    this.graphics.lineStyle(1, 0x333333);
    for (let x = 0; x <= this.GRID_WIDTH; x++) {
      this.graphics.moveTo(50 + x * this.BLOCK_SIZE, 200);
      this.graphics.lineTo(
        50 + x * this.BLOCK_SIZE,
        200 + this.GRID_HEIGHT * this.BLOCK_SIZE
      );
    }
    for (let y = 0; y <= this.GRID_HEIGHT; y++) {
      this.graphics.moveTo(50, 200 + y * this.BLOCK_SIZE);
      this.graphics.lineTo(
        50 + this.GRID_WIDTH * this.BLOCK_SIZE,
        200 + y * this.BLOCK_SIZE
      );
    }
    this.graphics.strokePath();

    // Blocos fixos
    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        if (this.grid[y][x] !== 0) {
          this.drawBlock(x, y, this.COLORS[this.grid[y][x]]);
        }
      }
    }

    // Peça atual
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

    this.graphics.fillStyle(color);
    this.graphics.fillRect(
      pixelX + 1,
      pixelY + 1,
      this.BLOCK_SIZE - 2,
      this.BLOCK_SIZE - 2
    );

    // Borda clara
    this.graphics.fillStyle(0xffffff);
    this.graphics.fillRect(pixelX + 1, pixelY + 1, this.BLOCK_SIZE - 2, 2);
    this.graphics.fillRect(pixelX + 1, pixelY + 1, 2, this.BLOCK_SIZE - 2);
  }
}

// Configuração do Phaser
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  parent: "game-canvas",
  backgroundColor: "#1a1a2e",
  scene: [MenuScene, HighScoreInputScene, TetrisGame],
};

// Inicializar jogo
console.log("Starting Phaser game...");
const game = new Phaser.Game(config);

// Inicializar o melhor score atual
HighScoreManager.updateBestScore();
