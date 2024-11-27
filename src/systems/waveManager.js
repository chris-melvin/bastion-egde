import * as BABYLON from '@babylonjs/core';

export class WaveManager {
    constructor(scene, pathfinding, uiScene) {
        this.scene = scene;
        this.pathfinding = pathfinding;
        this.uiScene = uiScene;
        
        // Wave configuration
        this.currentWave = 0;
        this.enemiesRemaining = 0;
        this.isWaveActive = false;
        this.spawnInterval = null;
        this.enemies = [];
        
        // Wave definitions
        this.waveConfigurations = this._defineWaves();
    }

    _defineWaves() {
        return [
            {
                enemyCount: 10,
                spawnInterval: 1000,
                enemyConfig: {
                    health: 100,
                    speed: 0.05,
                    reward: 10,
                    scale: 0.5
                }
            },
            {
                enemyCount: 15,
                spawnInterval: 800,
                enemyConfig: {
                    health: 150,
                    speed: 0.06,
                    reward: 15,
                    scale: 0.6
                }
            },
            // Add more waves with increasing difficulty
        ];
    }

    startWave() {
        if (this.isWaveActive) return;
        
        this.currentWave++;
        const waveConfig = this.waveConfigurations[this.currentWave - 1];
        
        if (!waveConfig) {
            console.log("Game Complete!");
            return;
        }

        this.isWaveActive = true;
        this.enemiesRemaining = waveConfig.enemyCount;
        this.uiScene.updateWave(this.currentWave);

        this.spawnInterval = setInterval(() => {
            this._spawnEnemy(waveConfig.enemyConfig);
            this.enemiesRemaining--;

            if (this.enemiesRemaining <= 0) {
                clearInterval(this.spawnInterval);
                this._checkWaveCompletion();
            }
        }, waveConfig.spawnInterval);
    }

    _spawnEnemy(config) {
        const path = this.pathfinding.findPath();
        if (!path) return;

        const enemy = BABYLON.MeshBuilder.CreateSphere("enemy", {
            diameter: 1 * config.scale
        }, this.scene);

        const material = new BABYLON.StandardMaterial("enemyMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        enemy.material = material;

        // Position at start of path
        const startPos = path[0];
        enemy.position = new BABYLON.Vector3(
            startPos.x * (this.pathfinding.pathSize + 5),
            1,
            startPos.z * (this.pathfinding.pathSize + 5)
        );

        // Add enemy properties
        enemy.health = config.health;
        enemy.speed = config.speed;
        enemy.reward = config.reward;
        enemy.pathIndex = 0;
        enemy.path = path;

        this.enemies.push(enemy);

        // Setup enemy movement
        this.scene.onBeforeRenderObservable.add(() => {
            this._updateEnemyPosition(enemy);
        });
    }

    _updateEnemyPosition(enemy) {
        if (!enemy.isDisposed() && enemy.path && enemy.pathIndex < enemy.path.length) {
            const targetPos = enemy.path[enemy.pathIndex];
            const targetWorldPos = new BABYLON.Vector3(
                targetPos.x * (this.pathfinding.pathSize + 5),
                1,
                targetPos.z * (this.pathfinding.pathSize + 5)
            );

            // Move towards target
            const direction = targetWorldPos.subtract(enemy.position);
            if (direction.length() < 0.1) {
                enemy.pathIndex++;
                if (enemy.pathIndex >= enemy.path.length) {
                    this._enemyReachedEnd(enemy);
                }
            } else {
                direction.normalize();
                enemy.position.addInPlace(direction.scale(enemy.speed));
            }
        }
    }

    _enemyReachedEnd(enemy) {
        this.uiScene.updateHealth(this.uiScene.playerHealth - 10);
        this._removeEnemy(enemy);
    }

    damageEnemy(enemy, damage) {
        enemy.health -= damage;
        if (enemy.health <= 0) {
            this.uiScene.updateCurrency(this.uiScene.currency + enemy.reward);
            this.uiScene.updateScore(this.uiScene.score + enemy.reward);
            this._removeEnemy(enemy);
        }
    }

    _removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            enemy.dispose();
            this._checkWaveCompletion();
        }
    }

    _checkWaveCompletion() {
        if (this.enemiesRemaining <= 0 && this.enemies.length === 0) {
            this.isWaveActive = false;
            // Add delay before next wave or wait for player input
            setTimeout(() => {
                if (this.currentWave < this.waveConfigurations.length) {
                    // Optional: Auto-start next wave or wait for player
                    // this.startWave();
                }
            }, 3000);
        }
    }

    pause() {
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
        }
        this.isWaveActive = false;
    }

    resume() {
        if (!this.isWaveActive && this.enemiesRemaining > 0) {
            this.startWave();
        }
    }
}
