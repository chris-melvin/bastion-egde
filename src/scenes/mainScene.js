import * as BABYLON from '@babylonjs/core';

export class MainScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.gridSize = 8;
        this.cellSize = 5;
        this.pathSize = 2.5;
        this.grid = [];

        this._createScene();
        this._createGrid();
        this._setupCamera();
        this._setupLights();
        this._setupInteraction();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    _createScene() {
        // Scene creation logic
    }

    _createGrid() {
        for (let x = 0; x < this.gridSize; x++) {
            this.grid[x] = [];
            for (let z = 0; z < this.gridSize; z++) {
                const cell = BABYLON.MeshBuilder.CreateBox(`cell_${x}_${z}`, {
                    width: this.cellSize,
                    height: 0.1,
                    depth: this.cellSize
                }, this.scene);
                cell.position.x = x * (this.cellSize + this.pathSize);
                cell.position.z = z * (this.cellSize + this.pathSize);
                cell.metadata = { isBlocked: false };
                this.grid[x][z] = cell;
            }
        }
    }

    _setupCamera() {
        const camera = new BABYLON.ArcRotateCamera("camera", 
            BABYLON.Tools.ToRadians(45), 
            BABYLON.Tools.ToRadians(60), 
            20, 
            new BABYLON.Vector3(this.gridSize / 2, 0, this.gridSize / 2), 
            this.scene
        );
        camera.attachControl(this.canvas, true);
    }

    _setupLights() {
        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), this.scene);
    }

    _setupInteraction() {
        this.scene.onPointerDown = (evt, pickResult) => {
            if (pickResult.hit && pickResult.pickedMesh) {
                const cell = pickResult.pickedMesh;
                if (cell.name.startsWith("cell_")) {
                    this._toggleCellBlock(cell);
                }
            }
        };
    }

    _toggleCellBlock(cell) {
        cell.metadata.isBlocked = !cell.metadata.isBlocked;
        cell.material = new BABYLON.StandardMaterial("cellMaterial", this.scene);
        cell.material.diffuseColor = cell.metadata.isBlocked ? BABYLON.Color3.Red() : BABYLON.Color3.Green();
    }
}
