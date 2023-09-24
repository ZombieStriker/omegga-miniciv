import { Brick } from "omegga";
import BrickLoader from "../bricks/loader";
import { createNoise2D } from "simplex-noise";

type Cell = {
    surfaceHeight: number;
    generatorHeight: number;
};

type Map = {
    [coordinate: string]: Cell;
};

export default class MapGenerator {
    public static readonly gridSize = 20;

    public static create(size: [number, number], seed?: number): Map {
        let map: Map = {};

        const noise2D = createNoise2D();

        const frequency = 100;
        const amplitude = 100;

        const octaves = 6;
        const persistence = 0.5;
        const lacunarity = 2;

        for (let x = 0; x < size[0]; x++) {
            for (let y = 0; y < size[1] / 2; y++) {
                let output = 0;

                for (let i = 1; i <= octaves; i++) {
                    output +=
                        noise2D((x / frequency) * ((1 / lacunarity) * i), (y / frequency) * ((1 / lacunarity) * i)) * amplitude * (persistence / i);
                }

                map[`${[x, y]}`] = {
                    surfaceHeight: Math.max(Math.trunc(output), 0) + 6,
                    generatorHeight: Math.trunc(output),
                };
            }
        }

        return map;
    }

    public static load(map: Map) {
        let terrain: Brick[] = [];

        const mapKeys = Object.keys(map);
        for (let i = 0; i < mapKeys.length; i++) {
            const cellPosition: [number, number] = mapKeys[i].match(/\d+/g).map((v) => parseInt(v)) as [number, number];
            const cell = map[mapKeys[i]];

            const colors = [
                [0, 0, 255],
                [50, 200, 255],
                [50, 235, 5],
            ];

            let color = [255, 255, 255];
            if (cell.surfaceHeight === 6) {
                const percent = Math.max(Math.min((cell.generatorHeight + 20) / 20, 1), 0);
                color = [
                    colors[1][0] * percent + colors[0][0] * (1 - percent),
                    colors[1][1] * percent + colors[0][1] * (1 - percent),
                    colors[1][2] * percent + colors[0][2] * (1 - percent),
                ];
            } else {
                color = colors[2];
            }

            terrain.push({
                color: [...color, 255],
                size: [this.gridSize, this.gridSize, cell.surfaceHeight],
                position: [
                    cellPosition[0] * this.gridSize * 2 + this.gridSize,
                    cellPosition[1] * this.gridSize * 2 + this.gridSize,
                    cell.surfaceHeight,
                ],
            });
        }

        BrickLoader.load(terrain);
    }
}
