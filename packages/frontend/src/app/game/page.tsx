'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/addresses';
import { parseAbi } from 'viem';

// UsageRights1155 ABI (simplified)
const USAGE_RIGHTS_ABI = parseAbi([
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function userOf(uint256 id, address owner) view returns (address user, uint64 expires, uint256 amountGranted)',
  'function isUserActive(uint256 id, address owner, address user) view returns (bool)',
  'function setUser(uint256 id, address user, uint256 amount, uint64 expires)',
  'function revokeUser(uint256 id, address user)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'event UpdateUser(address indexed owner, address indexed user, uint256 indexed id, uint256 amount, uint64 expires)',
]);

interface GameObject {
  id: string;
  type: 'player' | 'enemy' | 'bullet' | 'powerup';
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
  weaponType?: 'pistol' | 'shotgun' | 'laser';
  lastShot?: number;
  shootCooldown?: number;
}

interface GameState {
  player: GameObject;
  enemies: GameObject[];
  bullets: GameObject[];
  powerups: GameObject[];
  score: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
  keys: Set<string>;
}

export default function PixelShooter() {
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
    bullets: [],
    powerups: [],
    score: 0,
    level: 1,
    gameOver: false,
    paused: false,
    keys: new Set()
  });

  const { address, isConnected } = useAccount();

  // Blockchain item balances
  const { data: swordBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0', 1n],
    enabled: !!address
  });

  const { data: shieldBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0', 2n],
    enabled: !!address
  });

  const { data: herbBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0', 3n],
    enabled: !!address
  });

  const { data: potionBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0', 4n],
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

    createLevel(1);
  }, []);

  // Create level
  const createLevel = (level: number) => {
    const enemies: GameObject[] = [];
    const powerups: GameObject[] = [];

    // Create enemies based on level
    const enemyCount = 3 + level * 2;
    for (let i = 0; i < enemyCount; i++) {
      enemies.push({
        id: `enemy-${i}`,
        type: 'enemy',
        x: 600 + Math.random() * 150,
        y: 100 + Math.random() * 400,
        width: 20,
        height: 20,
        health: 30 + level * 10,
        maxHealth: 30 + level * 10,
        damage: 15,
        speed: 0.5 + level * 0.1,
        color: '#ff0000'
      });
    }

    // Create powerups
    powerups.push({
      id: 'sword-powerup',
      type: 'powerup',
      x: 200,
      y: 100,
      width: 15,
      height: 15,
      color: '#ffff00',
      blockchainEnhanced: true
    });

    powerups.push({
      id: 'health-powerup',
      type: 'powerup',
      x: 300,
      y: 500,
      width: 15,
      height: 15,
      color: '#00ffff'
    });

    setGameState(prev => ({
      ...prev,
      enemies,
      powerups,
      level
    }));
  };

  // Game loop
  useEffect(() => {
    if (gameState.gameOver) return;

    const gameLoop = () => {
      if (!gameState.paused) {
        updateGame();
      }
      renderGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameOver]);

  // Update game logic
  const updateGame = () => {
    setGameState(prev => {
      if (prev.gameOver || prev.paused) return prev;

      let newState = { ...prev };

      // Update player movement
      const player = { ...newState.player };
      const speed = 3;
      
      if (prev.keys.has('w')) player.y -= speed;
      if (prev.keys.has('s')) player.y += speed;
      if (prev.keys.has('a')) player.x -= speed;
      if (prev.keys.has('d')) player.x += speed;

      // Keep player in bounds
      player.x = Math.max(0, Math.min(780, player.x));
      player.y = Math.max(0, Math.min(580, player.y));

      newState.player = player;

      // Update enemies
      newState.enemies = newState.enemies.map(enemy => {
        const newEnemy = { ...enemy };
        
        // Move towards player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          newEnemy.x += (dx / distance) * enemy.speed!;
          newEnemy.y += (dy / distance) * enemy.speed!;
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

      // Check powerup collisions
      for (let i = newState.powerups.length - 1; i >= 0; i--) {
        const powerup = newState.powerups[i];
        if (checkCollision(player, powerup)) {
          if (powerup.id === 'sword-powerup') {
            player.weaponType = 'shotgun';
            player.damage = 50;
            player.shootCooldown = 200;
          } else if (powerup.id === 'health-powerup') {
            player.health = Math.min(player.maxHealth!, player.health! + 50);
          }
          newState.powerups.splice(i, 1);
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

    // Draw powerups
    gameState.powerups.forEach(powerup => {
      ctx.fillStyle = powerup.color;
      ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
      
      if (powerup.blockchainEnhanced) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(powerup.x - 2, powerup.y - 2, powerup.width + 4, powerup.height + 4);
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
    ctx.fillText('WASD: Move | Mouse: Shoot | SPACE: Pause | ESC: Exit', 10, canvas.height - 20);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setGameState(prev => ({
        ...prev,
        keys: new Set(prev.keys).add(e.key.toLowerCase())
      }));
      
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
      setGameState(prev => {
        const newKeys = new Set(prev.keys);
        newKeys.delete(e.key.toLowerCase());
        return { ...prev, keys: newKeys };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle mouse input
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
          <h1 className="text-4xl font-bold mb-4">🎮 Pixel Shooter</h1>
          <p className="text-xl mb-8">Connect your wallet to play with blockchain items!</p>
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
          <h1 className="text-4xl font-bold mb-4">🎮 Pixel Shooter</h1>
          <p className="text-xl mb-4">Shoot enemies and collect blockchain powerups!</p>
          
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
              <p className="text-sm"><strong>💡 Tip:</strong> Collect yellow powerups for enhanced weapons!</p>
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
            🎮 Pixel Shooter • Backpack Guilds Protocol • zkSync Sepolia
          </p>
        </div>
      </div>
    </div>
  );
}
