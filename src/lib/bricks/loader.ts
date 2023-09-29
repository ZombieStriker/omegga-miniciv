import { Brick, WriteSaveObject } from "../../../omegga";
import OmeggaImprovements from "../local_omegga";

enum Direction {
    XPositive = 0,
    XNegative = 1,
    YPositive = 2,
    YNegative = 3,
    ZPositive = 4,
    ZNegative = 5,
}
enum Rotation {
    Deg0 = 0,
    Deg90 = 1,
    Deg180 = 2,
    Deg270 = 3,
}

export default class BrickLoader {
    private static writeSaveObjectTemplate: Omit<WriteSaveObject, "bricks"> = {
        // Not really nessesary, but I want defaults to be explicitly defined.
        map: "Unknown",
        author: {
            name: "Unknown",
            id: "00000000-0000-0000-0000-000000000000",
        },
        description: "",
        save_time: [0, 0, 0, 0, 0, 0, 0, 0],
        mods: [],
        brick_assets: ["PB_DefaultMicroBrick"],
        colors: [],
        materials: ["BMC_Plastic", "BMC_Metallic", "BMC_Glow", "BMC_Glass", "BMC_Hologram"],
        physical_materials: [],
        brick_owners: [{}],
        preview: undefined,
    };

    private static brickTemplate: Omit<Brick, "position" | "size"> = {
        // A little more nessesary, currently, as of 9/9/2023, loading a save containing bricks without color crashes the plugin, this should prevent that.
        asset_name_index: 0,
        direction: Direction.ZPositive,
        rotation: Rotation.Deg0,
        collision: true,
        visibility: true,
        material_index: 0,
        material_intensity: 0,
        physical_index: 0,
        color: [255, 255, 255, 255],
        owner_index: 0,
        components: {},
    };

    public static load(
        bricks: Brick[],
        options?: {
            offX?: number;
            offY?: number;
            offZ?: number;
            quiet?: boolean;
            correctPalette?: boolean;
            correctCustom?: boolean;
        }
    ) {
        let processedBricks = bricks.map((brick) => {
            return { ...this.brickTemplate, ...brick };
        });
        let saveData: WriteSaveObject = {
            ...this.writeSaveObjectTemplate,
            bricks: processedBricks,
        };

        OmeggaImprovements.loadSaveData(saveData, options);
    }

    public static instanceload(
        bricks: Brick[],
        options?: {
            offX?: number;
            offY?: number;
            offZ?: number;
            quiet?: boolean;
            correctPalette?: boolean;
            correctCustom?: boolean;
        }[]
    ): Promise<void> {
        return new Promise((res) => {
            let processedBricks = bricks.map((brick) => {
                return { ...this.brickTemplate, ...brick };
            });
            let saveData: WriteSaveObject = {
                ...this.writeSaveObjectTemplate,
                bricks: processedBricks,
            };

            OmeggaImprovements.bakeSaveData(saveData).then(async (saveFile) => {
                for (let i = 0; i < options.length; i++) {
                    const option = options[i];
                    await OmeggaImprovements.loadBricks(saveFile, option);
                }
                OmeggaImprovements.removeSaveFile(saveFile);
                res();
            });
        });
    }
}
