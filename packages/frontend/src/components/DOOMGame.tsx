'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { USAGE_RIGHTS_ADDRESS, USAGE_RIGHTS_ABI } from '@/lib/addresses';

interface GameObject {
  id: string;
  type: 'player' | 'enemy' | 'item' | 'bullet' | 'wall';
  x: number;
  y: number;
  width: number;
  height: number;
  health?: number;
  maxHealth?: number;
  damage?: number;
  speed?: number;
  color: string;
  direction?: { x: number; y: number };
  blockchainEnhanced?: boolean;
  weaponType?: 'chainsaw' | 'shotgun' | 'pistol';
  lastShot?: number;
  shootCooldown?: number;
}

interface GameState {
  player: GameObject;
  enemies: GameObject[];
  items: GameObject[];
  bullets: GameObject[];
  walls: GameObject[];
  score: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
}

export function DOOMGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>({
    player: {
      id: 'player',
      type: 'player',
      x: 100,
      y: 300,
      width: 20,
      height: 20,
      health: 100,
      maxHealth: 100,
      color: '#00ff00',
      weaponType: 'pistol',
      lastShot: 0,
      shootCooldown: 500
    },
    enemies: [],
    items: [],
    bullets: [],
    walls: [],
    score: 0,
    level: 1,
    gameOver: false,
    paused: false
  });

  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isShooting, setIsShooting] = useState(false);

  const { address, isConnected } = useAccount();

  // Blockchain item balances
  const { data: swordBalance } = useReadContract({
    address: USAGE_RIGHTS_ADDRESS,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0', 1],
    enabled: !!address
  });

  const { data: shieldBalance } = useReadContract({
    address: USAGE_RIGHTS_ADDRESS,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0', 2],
    enabled: !!address
  });

  const { data: herbBalance } = useReadContract({
    address: USAGE_RIGHTS_ADDRESS,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0', 3],
    enabled: !!address
  });

  const { data: potionBalance } = useReadContract({
    address: USAGE_RIGHTS_ADDRESS,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0', 4],
    enabled: !!address
  });

  // Initialize game
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Create initial level
    createLevel(1);
  }, []);

  // Create level
  const createLevel = (level: number) => {
    const enemies: GameObject[] = [];
    const items: GameObject[] = [];
    const walls: GameObject[] = [];

    // Create walls
    for (let i = 0; i < 5; i++) {
      walls.push({
        id: `wall-${i}`,
        type: 'wall',
        x: 200 + i * 100,
        y: 150 + (i % 2) * 200,
        width: 80,
        height: 20,
        color: '#666666'
      });
    }

    // Create enemies based on level
    const enemyCount = 3 + level * 2;
    for (let i = 0; i < enemyCount; i++) {
      enemies.push({
        id: `enemy-${i}`,
        type: 'enemy',
        x: 600 + Math.random() * 150,
        y: 100 + Math.random() * 400,
        width: 25,
        height: 25,
        health: 30 + level * 10,
        maxHealth: 30 + level * 10,
        damage: 15,
        speed: 0.5 + level * 0.2,
        color: '#ff0000'
      });
    }

    // Create items
    items.push({
      id: 'sword-item',
      type: 'item',
      x: 200,
      y: 100,
      width: 20,
      height: 20,
      color: '#ffff00',
      blockchainEnhanced: true
    });

    items.push({
      id: 'health-item',
      type: 'item',
      x: 300,
      y: 500,
      width: 15,
      height: 15,
      color: '#00ffff'
    });

    setGameState(prev => ({
      ...prev,
      enemies,
      items,
      walls,
      level
    }));
  };

  // Game loop
  useEffect(() => {
    if (gameState.gameOver || gameState.paused) return;

    const gameLoop = () => {
      updateGame();
      renderGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameOver, gameState.paused, keys]);

  // Update game logic
  const updateGame = () => {
    setGameState(prev => {
      let newState = { ...prev };

      // Update player movement
      const player = { ...newState.player };
      const speed = 3;
      
      // Store original position for collision detection
      const originalX = player.x;
      const originalY = player.y;
      
      if (keys.has('w')) player.y -= speed;
      if (keys.has('s')) player.y += speed;
      if (keys.has('a')) player.x -= speed;
      if (keys.has('d')) player.x += speed;

      // Keep player in bounds
      player.x = Math.max(0, Math.min(780, player.x));
      player.y = Math.max(0, Math.min(580, player.y));

      // Check wall collisions for player
      let collided = false;
      for (const wall of newState.walls) {
        if (checkCollision(player, wall)) {
          collided = true;
          break;
        }
      }
      
      // If collided, revert to original position
      if (collided) {
        player.x = originalX;
        player.y = originalY;
      }

      newState.player = player;

      // Update enemies with improved AI
      newState.enemies = newState.enemies.map(enemy => {
        const newEnemy = { ...enemy };
        
        // Calculate direction to player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const moveX = (dx / distance) * enemy.speed!;
          const moveY = (dy / distance) * enemy.speed!;
          
          // Try to move towards player
          const newX = enemy.x + moveX;
          const newY = enemy.y + moveY;
          
          // Check if new position collides with walls
          let canMoveX = true;
          let canMoveY = true;
          
          const tempEnemy = { ...enemy, x: newX, y: enemy.y };
          for (const wall of newState.walls) {
            if (checkCollision(tempEnemy, wall)) {
              canMoveX = false;
              break;
            }
          }
          
          const tempEnemyY = { ...enemy, x: enemy.x, y: newY };
          for (const wall of newState.walls) {
            if (checkCollision(tempEnemyY, wall)) {
              canMoveY = false;
              break;
            }
          }
          
          // Move if possible
          if (canMoveX) newEnemy.x = newX;
          if (canMoveY) newEnemy.y = newY;
          
          // If stuck, try alternative paths
          if (!canMoveX && !canMoveY) {
            // Try moving only horizontally
            const altX = enemy.x + (Math.random() - 0.5) * enemy.speed! * 2;
            const altEnemyX = { ...enemy, x: altX, y: enemy.y };
            let canMoveAltX = true;
            for (const wall of newState.walls) {
              if (checkCollision(altEnemyX, wall)) {
                canMoveAltX = false;
                break;
              }
            }
            if (canMoveAltX) newEnemy.x = altX;
            
            // Try moving only vertically
            const altY = enemy.y + (Math.random() - 0.5) * enemy.speed! * 2;
            const altEnemyY = { ...enemy, x: enemy.x, y: altY };
            let canMoveAltY = true;
            for (const wall of newState.walls) {
              if (checkCollision(altEnemyY, wall)) {
                canMoveAltY = false;
                break;
              }
            }
            if (canMoveAltY) newEnemy.y = altY;
          }
        }

        return newEnemy;
      });

      // Update bullets
      newState.bullets = newState.bullets.filter(bullet => {
        bullet.x += bullet.direction!.x * 8;
        bullet.y += bullet.direction!.y * 8;

        // Remove bullets that are out of bounds
        if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
          return false;
        }

        // Check bullet collisions with walls
        for (const wall of newState.walls) {
          if (checkCollision(bullet, wall)) {
            return false;
          }
        }

        // Check bullet collisions with enemies
        for (let i = newState.enemies.length - 1; i >= 0; i--) {
          const enemy = newState.enemies[i];
          if (checkCollision(bullet, enemy)) {
            enemy.health! -= 25;
            if (enemy.health! <= 0) {
              newState.enemies.splice(i, 1);
              newState.score += 100;
            }
            return false;
          }
        }

        return true;
      });

      // Check item collisions
      for (let i = newState.items.length - 1; i >= 0; i--) {
        const item = newState.items[i];
        if (checkCollision(player, item)) {
          if (item.id === 'sword-item') {
            player.weaponType = 'chainsaw';
            player.damage = 50;
            player.shootCooldown = 200;
          } else if (item.id === 'health-item') {
            player.health = Math.min(player.maxHealth!, player.health! + 50);
          }
          newState.items.splice(i, 1);
        }
      }

      // Check enemy collisions with player
      for (const enemy of newState.enemies) {
        if (checkCollision(player, enemy)) {
          player.health! -= 1;
          if (player.health! <= 0) {
            newState.gameOver = true;
          }
        }
      }

      // Check if level is complete
      if (newState.enemies.length === 0) {
        newState.level += 1;
        createLevel(newState.level);
      }

      return newState;
    });
  };

  // Check collision between two objects
  const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  };

  // Render game
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw walls
    gameState.walls.forEach(wall => {
      ctx.fillStyle = wall.color;
      ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });

    // Draw items
    gameState.items.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.fillRect(item.x, item.y, item.width, item.height);
      
      if (item.blockchainEnhanced) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(item.x - 2, item.y - 2, item.width + 4, item.height + 4);
      }
    });

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      
      // Draw health bar
      if (enemy.health! < enemy.maxHealth!) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x, enemy.y - 8, (enemy.health! / enemy.maxHealth!) * enemy.width, 4);
      }
    });

    // Draw bullets
    gameState.bullets.forEach(bullet => {
      ctx.fillStyle = bullet.color;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw player
    ctx.fillStyle = gameState.player.color;
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);

    // Draw UI
    drawUI(ctx);
  };

  // Draw UI
  const drawUI = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Health bar
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 10, 200, 20);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(10, 10, (gameState.player.health! / gameState.player.maxHealth!) * 200, 20);

    // Score and level
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 10, 50);
    ctx.fillText(`Level: ${gameState.level}`, 10, 70);

    // Weapon info
    ctx.fillText(`Weapon: ${gameState.player.weaponType}`, 10, 90);

    // Blockchain items
    let yOffset = 110;
    if (swordBalance && Number(swordBalance) > 0) {
      ctx.fillStyle = '#ffff00';
      ctx.fillText(`Sword: ${Number(swordBalance)}`, 10, yOffset);
      yOffset += 20;
    }
    if (shieldBalance && Number(shieldBalance) > 0) {
      ctx.fillStyle = '#00ffff';
      ctx.fillText(`Shield: ${Number(shieldBalance)}`, 10, yOffset);
      yOffset += 20;
    }
    if (herbBalance && Number(herbBalance) > 0) {
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`Herb: ${Number(herbBalance)}`, 10, yOffset);
      yOffset += 20;
    }
    if (potionBalance && Number(potionBalance) > 0) {
      ctx.fillStyle = '#ff00ff';
      ctx.fillText(`Potion: ${Number(potionBalance)}`, 10, yOffset);
      yOffset += 20;
    }

    // Controls
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('WASD: Move | Mouse: Aim & Shoot | SPACE: Pause | ESC: Exit', 10, canvas.height - 20);
    
    // Debug info
    ctx.fillStyle = '#ffff00';
    ctx.font = '10px Arial';
    ctx.fillText(`Keys: ${Array.from(keys).join(', ')}`, 10, canvas.height - 40);
    ctx.fillText(`Player: ${Math.round(player.x)}, ${Math.round(player.y)}`, 10, canvas.height - 55);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key down:', e.key);
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
      
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState(prev => ({ ...prev, paused: !prev.paused }));
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setGameState(prev => ({ ...prev, gameOver: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      console.log('Key up:', e.key);
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle player movement - moved to updateGame function

  // Handle mouse input
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.gameOver || gameState.paused) return;

    const now = Date.now();
    if (now - gameState.player.lastShot! < gameState.player.shootCooldown!) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const player = gameState.player;
    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const bullet: GameObject = {
        id: `bullet-${Date.now()}`,
        type: 'bullet',
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        width: 5,
        height: 5,
        color: '#ffff00',
        direction: {
          x: dx / distance,
          y: dy / distance
        }
      };

      setGameState(prev => ({
        ...prev,
        bullets: [...prev.bullets, bullet],
        player: { ...prev.player, lastShot: now }
      }));
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🎮 DOOM Blockchain</h1>
          <p className="text-xl mb-8">Connect your wallet to play DOOM with blockchain items!</p>
          <div className="bg-red-600 p-4 rounded-lg">
            <p className="text-lg">⚠️ Wallet not connected</p>
            <p className="text-sm">Please connect your wallet to access blockchain features</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🎮 DOOM Blockchain</h1>
          <p className="text-xl mb-4">Play DOOM with blockchain-enhanced weapons!</p>
          
          {gameState.paused && (
            <div className="bg-yellow-600 p-4 rounded-lg mb-4">
              <p className="text-lg">⏸️ Game Paused</p>
              <p className="text-sm">Press SPACE to resume</p>
            </div>
          )}

          {gameState.gameOver && (
            <div className="bg-red-600 p-4 rounded-lg mb-4">
              <p className="text-lg">💀 Game Over</p>
              <p className="text-sm">Final Score: {gameState.score}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Restart Game
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center mb-8">
          <canvas
            ref={canvasRef}
            className="border-2 border-white bg-black"
            onMouseMove={handleMouseMove}
            onClick={handleMouseClick}
            style={{ cursor: 'crosshair' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">🎮 Game Controls</h2>
            <ul className="space-y-2">
              <li><strong>WASD:</strong> Move player</li>
              <li><strong>Mouse:</strong> Aim and shoot</li>
              <li><strong>SPACE:</strong> Pause/Resume</li>
              <li><strong>ESC:</strong> Exit game</li>
            </ul>
            <div className="mt-4 p-3 bg-yellow-600 rounded">
              <p className="text-sm"><strong>💡 Tip:</strong> Enemies now have improved AI and can navigate around obstacles!</p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">🔗 Blockchain Items</h2>
            <div className="space-y-2">
              {swordBalance && Number(swordBalance) > 0 && (
                <div className="flex justify-between">
                  <span className="text-yellow-400">⚔️ Sword:</span>
                  <span>{Number(swordBalance)}</span>
                </div>
              )}
              {shieldBalance && Number(shieldBalance) > 0 && (
                <div className="flex justify-between">
                  <span className="text-cyan-400">🛡️ Shield:</span>
                  <span>{Number(shieldBalance)}</span>
                </div>
              )}
              {herbBalance && Number(herbBalance) > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-400">🌿 Herb:</span>
                  <span>{Number(herbBalance)}</span>
                </div>
              )}
              {potionBalance && Number(potionBalance) > 0 && (
                <div className="flex justify-between">
                  <span className="text-purple-400">🧪 Potion:</span>
                  <span>{Number(potionBalance)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            🎮 DOOM Blockchain Integration • Backpack Guilds Protocol • zkSync Sepolia
          </p>
        </div>
      </div>
    </div>
  );
}
