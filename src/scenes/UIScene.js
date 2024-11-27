import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

export class UIScene {
    constructor(scene) {
        this.scene = scene;
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        // Game state
        this.playerHealth = 100;
        this.score = 0;
        this.currency = 1000;
        this.currentWave = 0;
        this.totalWaves = 10;
        this.isEditing = true;

        this._createPlayerStats();
        this._createWaveIndicator();
        this._createTowerSelectionPanel();
        this._createGameControls();
        this._createModeToggle();
    }

    _createPlayerStats() {
        const statsPanel = new GUI.StackPanel();
        statsPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        statsPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        statsPanel.left = 20;
        statsPanel.top = 20;
        this.advancedTexture.addControl(statsPanel);

        const createStatText = (text) => {
            const textBlock = new GUI.TextBlock();
            textBlock.height = "30px";
            textBlock.color = "white";
            textBlock.fontSize = 24;
            textBlock.text = text;
            return textBlock;
        };

        this.healthText = createStatText(`Health: ${this.playerHealth}`);
        this.scoreText = createStatText(`Score: ${this.score}`);
        this.currencyText = createStatText(`Gold: ${this.currency}`);

        statsPanel.addControl(this.healthText);
        statsPanel.addControl(this.scoreText);
        statsPanel.addControl(this.currencyText);
    }

    _createWaveIndicator() {
        this.waveText = new GUI.TextBlock();
        this.waveText.text = `Wave ${this.currentWave}/${this.totalWaves}`;
        this.waveText.color = "white";
        this.waveText.fontSize = 32;
        this.waveText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.waveText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.waveText.top = 20;
        this.advancedTexture.addControl(this.waveText);
    }

    _createTowerSelectionPanel() {
        const panel = new GUI.StackPanel();
        panel.width = "150px";
        panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        panel.right = 20;
        this.advancedTexture.addControl(panel);

        const towers = [
            { name: "Basic Tower", cost: 100 },
            { name: "Sniper Tower", cost: 200 },
            { name: "Area Tower", cost: 300 }
        ];

        towers.forEach(tower => {
            const button = GUI.Button.CreateSimpleButton(
                tower.name, 
                `${tower.name}\n${tower.cost}g`
            );
            button.height = "60px";
            button.color = "white";
            button.background = "green";
            button.onPointerClickObservable.add(() => {
                if (this.isEditing) return; // Prevent tower placement in edit mode
                if (this.currency >= tower.cost) {
                    this.mainScene.setSelectedTower(tower.name);
                }
            });
            panel.addControl(button);
        });
    }

    _createGameControls() {
        this.playPauseButton = GUI.Button.CreateSimpleButton("playPause", "Start");
        this.playPauseButton.width = "100px";
        this.playPauseButton.height = "40px";
        this.playPauseButton.color = "white";
        this.playPauseButton.background = "green";
        this.playPauseButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.playPauseButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.playPauseButton.top = 20;
        this.playPauseButton.right = 20;
        
        this.playPauseButton.onPointerClickObservable.add(() => {
            const isPlaying = this.playPauseButton.textBlock.text === "Pause";
            this.playPauseButton.textBlock.text = isPlaying ? "Start" : "Pause";
            if (isPlaying) {
                this.mainScene.waveManager.pause();
            } else {
                this.mainScene.waveManager.startWave();
            }
        });

        this.advancedTexture.addControl(this.playPauseButton);
    }

    _createModeToggle() {
        this.modeToggle = GUI.Button.CreateSimpleButton("modeToggle", "Edit Mode: ON");
        this.modeToggle.width = "150px";
        this.modeToggle.height = "40px";
        this.modeToggle.color = "white";
        this.modeToggle.background = "blue";
        this.modeToggle.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.modeToggle.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.modeToggle.left = 20;
        this.modeToggle.bottom = 20;
        
        this.modeToggle.onPointerClickObservable.add(() => {
            this.isEditing = !this.isEditing;
            this.modeToggle.textBlock.text = `Edit Mode: ${this.isEditing ? 'ON' : 'OFF'}`;
            // Implement mode switching logic
        });

        this.advancedTexture.addControl(this.modeToggle);
    }

    // Public methods to update UI elements
    updateHealth(health) {
        this.playerHealth = health;
        this.healthText.text = `Health: ${this.playerHealth}`;
    }

    updateScore(score) {
        this.score = score;
        this.scoreText.text = `Score: ${this.score}`;
    }

    updateCurrency(currency) {
        this.currency = currency;
        this.currencyText.text = `Gold: ${this.currency}`;
    }

    updateWave(wave) {
        this.currentWave = wave;
        this.waveText.text = `Wave ${this.currentWave}/${this.totalWaves}`;
    }
}
