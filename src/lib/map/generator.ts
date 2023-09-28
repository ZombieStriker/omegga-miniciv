import { Brick } from "omegga";
import BrickLoader from "../bricks/loader";
import { createNoise2D } from "simplex-noise";

enum Biome {
    GrassLand,
    Plains,
    Desert,
    Tundra,
    Snow,
    Water,
    Deep_Water,
}

type Cell = {
    surfaceHeight: number;
    generatorHeight: number;
    temperature: number;
    moisture: number;
    biome: Biome;
};

type Map = {
    size: [number, number];
    cells: {
        [coordinate: string]: Cell;
    };
};

export default class MapGenerator {
    public static readonly gridSize = 40;

    public static create(size: [number, number], seed: number): Map {
        let map: Map = {
            size: size,
            cells: {},
        };

        const heightOffset = 0;
        const temperatureOffset = 0;
        const moistureOffset = 0;

        const noise2D = createNoise2D(() => seed);

        const frequency = 50;
        const amplitude = 25;

        const octaves = 16;
        const persistence = 0.5;
        const lacunarity = 2;

        // Height/Moisture/Temperature Pass
        for (let x = 0; x < size[0]; x++) {
            for (let y = 0; y < size[1]; y++) {
                let heightOutput = 0;
                let temperatureOutput = 0;
                let moistureOutput = 0;

                for (let i = 1; i <= octaves; i++) {
                    const heightOffsetY = i * 4300;
                    const heightOffsetX = i * 11200;
                    heightOutput +=
                        (noise2D(heightOffsetX + (x / frequency) * ((1 / lacunarity) * i), heightOffsetY + (y / frequency) * ((1 / lacunarity) * i)) +
                            heightOffset) *
                        amplitude *
                        (persistence / i);

                    const temperatureOffsetY = (i + 5) * 45300;
                    const temperatureOffsetX = (i + 5) * 23200;
                    temperatureOutput +=
                        noise2D(
                            temperatureOffsetX + (x / frequency) * ((1 / lacunarity) * i),
                            temperatureOffsetY + (y / frequency) * ((1 / lacunarity) * i)
                        ) *
                        1 *
                        (persistence / i);

                    const moistureOffsetY = (i + 10) * 51600;
                    const moistureOffsetX = (i + 10) * 73200;
                    moistureOutput +=
                        noise2D(
                            moistureOffsetX + (x / frequency) * ((1 / lacunarity) * i),
                            moistureOffsetY + (y / frequency) * ((1 / lacunarity) * i)
                        ) *
                        1 *
                        (persistence / i);
                }

                temperatureOutput = Math.max(
                    Math.min((Math.min(y, size[1] - y) - size[1] / 4) / (size[1] / 4) + temperatureOutput + temperatureOffset, 2),
                    -2
                );
                moistureOutput = Math.max(Math.min(moistureOutput + moistureOffset, 2), -2);

                map.cells[`${[x, y]}`] = {
                    surfaceHeight: Math.max(Math.trunc(heightOutput), 0) + 6,
                    generatorHeight: Math.trunc(heightOutput),
                    temperature: temperatureOutput,
                    moisture: moistureOutput,
                    biome: Biome.GrassLand,
                };

                if (map.cells[`${[x, y]}`].generatorHeight <= 0) {
                    map.cells[`${[x, y]}`].biome = Biome.Water;
                }

                if (map.cells[`${[x, y]}`].generatorHeight <= -5) {
                    map.cells[`${[x, y]}`].biome = Biome.Deep_Water;
                }
            }
        }

        // Biome Pass
        for (let x = 0; x < size[0]; x++) {
            for (let y = 0; y < size[1]; y++) {
                let cell = map.cells[`${[x, y]}`];

                if (cell.temperature < -0.5) {
                    cell.biome = Biome.Snow;
                }

                if (cell.biome === Biome.Water || cell.biome === Biome.Deep_Water || cell.biome === Biome.Snow) continue;

                if (cell.moisture > 0 && cell.temperature > 0) {
                    cell.biome = Biome.Plains;
                }

                if (cell.moisture > 0 && cell.temperature > 0.5) {
                    cell.biome = Biome.GrassLand;
                }

                if (cell.moisture < 0 && cell.temperature > 0) {
                    cell.biome = Biome.Desert;
                }

                if ((cell.moisture > 0.5 && cell.temperature < 0) || cell.temperature < -0.25) {
                    cell.biome = Biome.Tundra;
                }
            }
        }

        return map;
    }

    public static load(
        map: Map,
        options?: {
            offX?: number;
            offY?: number;
            offZ?: number;
            quiet?: boolean;
            correctPalette?: boolean;
            correctCustom?: boolean;
        }
    ) {
        let terrain: Brick[] = [];

        const mapKeys = Object.keys(map.cells);
        for (let i = 0; i < mapKeys.length; i++) {
            const cellPosition: [number, number] = mapKeys[i].match(/\d+/g).map((v) => parseInt(v)) as [number, number];
            const cell = map.cells[mapKeys[i]];

            const colors = [
                [0, 0, 255], // Deep ocean
                [50, 200, 255], // Shallow water
                [50, 245, 5], // Grassland
                [100, 205, 20], // Plains
                [200, 180, 80], // Desert
                [100, 80, 10], // Tundra
                [250, 250, 250], // Snow
                [225, 225, 255], // Ice Sheet
            ];

            let selectedColor = [255, 255, 255];

            if (cell.biome === Biome.Water || cell.biome === Biome.Deep_Water) {
                // Water :D
                const percent = Math.max(Math.min((cell.generatorHeight + 5) / 5, 1), 0);
                selectedColor = [
                    colors[1][0] * percent + colors[0][0] * (1 - percent),
                    colors[1][1] * percent + colors[0][1] * (1 - percent),
                    colors[1][2] * percent + colors[0][2] * (1 - percent),
                ];
            }

            if (cell.biome === Biome.GrassLand) {
                selectedColor = colors[2];
            }

            if (cell.biome === Biome.Plains) {
                selectedColor = colors[3];
            }

            if (cell.biome === Biome.Desert) {
                selectedColor = colors[4];
            }

            if (cell.biome === Biome.Tundra) {
                selectedColor = colors[5];
            }

            if (cell.biome === Biome.Snow) {
                selectedColor = colors[6];
            }

            if (cell.biome === Biome.Snow && cell.generatorHeight <= 0) {
                selectedColor = colors[7];
            }

            terrain.push({
                color: [...selectedColor, 255],
                size: [this.gridSize, this.gridSize, cell.surfaceHeight],
                position: [
                    cellPosition[0] * this.gridSize * 2 + this.gridSize,
                    cellPosition[1] * this.gridSize * 2 + this.gridSize,
                    cell.surfaceHeight,
                ],
            });
        }

        BrickLoader.load(terrain, options);
    }
}
