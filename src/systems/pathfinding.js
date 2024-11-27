import * as BABYLON from '@babylonjs/core';

export class PathfindingSystem {
    constructor(scene, gridSize, pathSize) {
        this.scene = scene;
        this.gridSize = gridSize;
        this.pathSize = pathSize;
        this.grid = [];
        this.pathMeshes = [];
        this.startPoint = { x: 0, z: 0 };
        this.endPoint = { x: gridSize - 1, z: gridSize - 1 };
    }

    initializeGrid(gameGrid) {
        // Convert the Babylon.js mesh grid to a pathfinding grid
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(1));
        
        for (let x = 0; x < this.gridSize; x++) {
            for (let z = 0; z < this.gridSize; z++) {
                const cell = gameGrid[x][z];
                this.grid[x][z] = cell.metadata.isBlocked ? 0 : 1;
            }
        }
    }

    findPath() {
        this.clearPathVisualization();
        const path = this.aStarSearch();
        
        if (path) {
            this.visualizePath(path);
            return true;
        }
        return false;
    }

    aStarSearch() {
        const openSet = [this.startPoint];
        const closedSet = new Set();
        const cameFrom = new Map();
        
        const gScore = new Map();
        const fScore = new Map();
        
        gScore.set(`${this.startPoint.x},${this.startPoint.z}`, 0);
        fScore.set(`${this.startPoint.x},${this.startPoint.z}`, this.heuristic(this.startPoint));

        while (openSet.length > 0) {
            const current = this.getLowestFScore(openSet, fScore);
            
            if (current.x === this.endPoint.x && current.z === this.endPoint.z) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(`${current.x},${current.z}`);

            for (const neighbor of this.getNeighbors(current)) {
                if (closedSet.has(`${neighbor.x},${neighbor.z}`)) continue;

                const tentativeGScore = gScore.get(`${current.x},${current.z}`) + 1;

                if (!openSet.some(p => p.x === neighbor.x && p.z === neighbor.z)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= gScore.get(`${neighbor.x},${neighbor.z}`)) {
                    continue;
                }

                cameFrom.set(`${neighbor.x},${neighbor.z}`, current);
                gScore.set(`${neighbor.x},${neighbor.z}`, tentativeGScore);
                fScore.set(`${neighbor.x},${neighbor.z}`, tentativeGScore + this.heuristic(neighbor));
            }
        }

        return null;
    }

    getNeighbors(point) {
        const neighbors = [];
        const directions = [
            { x: 0, z: 1 }, { x: 1, z: 0 },
            { x: 0, z: -1 }, { x: -1, z: 0 }
        ];

        for (const dir of directions) {
            const newX = point.x + dir.x;
            const newZ = point.z + dir.z;

            if (this.isValidPosition(newX, newZ) && this.grid[newX][newZ] === 1) {
                neighbors.push({ x: newX, z: newZ });
            }
        }

        return neighbors;
    }

    isValidPosition(x, z) {
        return x >= 0 && x < this.gridSize && z >= 0 && z < this.gridSize;
    }

    heuristic(point) {
        return Math.abs(point.x - this.endPoint.x) + Math.abs(point.z - this.endPoint.z);
    }

    getLowestFScore(openSet, fScore) {
        return openSet.reduce((lowest, current) => {
            const currentScore = fScore.get(`${current.x},${current.z}`) || Infinity;
            const lowestScore = fScore.get(`${lowest.x},${lowest.z}`) || Infinity;
            return currentScore < lowestScore ? current : lowest;
        });
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        let currentKey = `${current.x},${current.z}`;

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey);
            currentKey = `${current.x},${current.z}`;
            path.unshift(current);
        }

        return path;
    }

    clearPathVisualization() {
        this.pathMeshes.forEach(mesh => mesh.dispose());
        this.pathMeshes = [];
    }

    visualizePath(path) {
        const pathMaterial = new BABYLON.StandardMaterial("pathMaterial", this.scene);
        pathMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
        pathMaterial.alpha = 0.5;

        for (const point of path) {
            const pathMarker = BABYLON.MeshBuilder.CreateBox("pathMarker", {
                width: this.pathSize,
                height: 0.2,
                depth: this.pathSize
            }, this.scene);

            pathMarker.position.x = point.x * (this.pathSize + 5);
            pathMarker.position.y = 0.1;
            pathMarker.position.z = point.z * (this.pathSize + 5);
            pathMarker.material = pathMaterial;

            this.pathMeshes.push(pathMarker);
        }
    }
}
