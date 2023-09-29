import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import Runtime from "src/runtime/main";

type BrickadiaFile = {
    type: "build" | "minigame" | "environment";
    name: string;
    location: "plugin" | "brickadia";
    path: string;
};

/**
 * BrickadiaContentSync API
 * Allows for easy copying of game files between the plugin and brickadia
 */
export default class BrickadiaContentSync {
    private dataPath: string;

    /**
     * @param plugin_data_path The plugin's "game data" root path.
     */
    constructor(plugin_data_path: string) {
        this.dataPath = plugin_data_path;
    }

    /**
     * Creates the BrickadiaFile object
     * @param file_path The file path relative the root path
     * @param location Determines what root path to use
     * @param type Used to build the BrickadiaFile object, and to find the relevant path for brickadia's root.
     * @returns BrickadiaFile
     */
    public getFile(file_path: string, location: "plugin" | "brickadia", type: "build" | "minigame" | "environment"): BrickadiaFile | null {
        const fileLocation = (() => {
            if (location === "plugin") {
                return path.join(this.dataPath, file_path);
            } else {
                switch (type) {
                    case "build":
                        return path.join(this.getBrickadiaBuildPath(), `${file_path}.brs`);
                    case "minigame":
                        return path.join(this.getBrickadiaEnvironmentPath(), `${path.basename(Runtime.path)}_${file_path}_environment.bp`);
                    case "environment":
                        return path.join(this.getBrickadiaMinigamePath(), `${path.basename(Runtime.path)}_${file_path}_minigame.bp`);
                }
            }
        })();

        let brickadiaFile: BrickadiaFile;
        if (fs.existsSync(fileLocation)) {
            brickadiaFile = {
                type: type,
                location: location,
                name: path.basename(fileLocation).match(/(.*)\.[^.]+$/)[1],
                path: fileLocation,
            };
            return brickadiaFile;
        }
    }

    /**
     * Creates an array of BrickadiaFile objects from the plugin side
     * @param file_path The file path relative the root path
     * @param type Used to build the BrickadiaFile object.
     * @returns Promise to BrickadiaFile
     */
    public getFilesInPlugin(file_path: string, type: "build" | "minigame" | "environment"): Promise<BrickadiaFile[] | null> {
        return new Promise((res) => {
            let brickadiaFiles: BrickadiaFile[] = [];

            fsp.readdir(path.join(this.dataPath, file_path))
                .then((results) => {
                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];
                        const parsed = path.parse(result);
                        if (!parsed.ext) continue;

                        brickadiaFiles.push({
                            type: type,
                            location: "plugin",
                            name: path.basename(result).match(/(.*)\.[^.]+$/)[1],
                            path: path.join(this.dataPath, file_path, result),
                        });
                    }
                    res(brickadiaFiles);
                })
                .catch((err) => {
                    console.warn(err);
                });
        });
    }

    /**
     * Copies a game file from the plugin to brickadia using a BrickadiaFile
     * @param file BrickadiaFile Object
     * @returns A promise that resolves when the file is copied.
     */
    public async copyToBrickadia(file: BrickadiaFile): Promise<void> {
        return new Promise((res) => {
            if (file.location === "brickadia") return;

            switch (file.type) {
                case "build":
                    {
                        const destinationPath = path.join(this.getBrickadiaBuildPath(), `${file.name}.brs`);
                        const sourcePath = file.path;

                        fsp.mkdir(path.dirname(destinationPath), { recursive: true }).then(() => {
                            if (fs.existsSync(destinationPath)) {
                                res();
                            }
                            fsp.copyFile(sourcePath, destinationPath)
                                .then(res)
                                .catch((err) => {
                                    console.warn(err);
                                });
                        });
                    }
                    break;
                case "environment":
                    {
                        const destinationPath = path.join(
                            this.getBrickadiaEnvironmentPath(),
                            `${path.basename(Runtime.path)}_${file.name}_environment.bp`
                        );
                        const sourcePath = file.path;

                        fsp.mkdir(path.dirname(destinationPath), { recursive: true }).then(() => {
                            if (fs.existsSync(destinationPath)) {
                                res();
                            }
                            fsp.copyFile(sourcePath, destinationPath)
                                .then(res)
                                .catch((err) => {
                                    console.warn(err);
                                });
                        });
                    }
                    break;
                case "minigame":
                    {
                        const destinationPath = path.join(this.getBrickadiaMinigamePath(), `${path.basename(Runtime.path)}_${file.name}_minigame.bp`);
                        const sourcePath = file.path;

                        fsp.mkdir(path.dirname(destinationPath), { recursive: true }).then(() => {
                            if (fs.existsSync(destinationPath)) {
                                res();
                            }
                            fsp.copyFile(sourcePath, destinationPath)
                                .then(res)
                                .catch((err) => {
                                    console.warn(err);
                                });
                        });
                    }
                    break;
            }
        });
    }

    /**
     * Copies a game file from brickadia to the plugin using a BrickadiaFile and destination.
     * @param file BrickadiaFile Object
     * @param destination The path relative to the plugin game data root.
     * @returns A promise that resolves when the file is copied.
     */
    public async copyToPlugin(file: BrickadiaFile, destination: string): Promise<void> {
        return new Promise((res) => {
            if (file.location === "plugin") return;
            switch (file.type) {
                case "build":
                    {
                        const destinationPath = path.join(this.dataPath, `${destination}.brs`);
                        const sourcePath = file.path;

                        fsp.mkdir(path.dirname(destinationPath), { recursive: true }).then(() => {
                            if (fs.existsSync(destinationPath)) {
                                res();
                            }
                            fsp.copyFile(sourcePath, destinationPath)
                                .then(res)
                                .catch((err) => {
                                    console.warn(err);
                                });
                        });
                    }
                    break;
                case "environment":
                    {
                        const destinationPath = path.join(this.dataPath, `${destination}.bp`);
                        const sourcePath = file.path;

                        fsp.mkdir(path.dirname(destinationPath), { recursive: true }).then(() => {
                            if (fs.existsSync(destinationPath)) {
                                res();
                            }
                            fsp.copyFile(sourcePath, destinationPath)
                                .then(res)
                                .catch((err) => {
                                    console.warn(err);
                                });
                        });
                    }
                    break;
                case "minigame":
                    {
                        const destinationPath = path.join(this.dataPath, `${destination}.bp`);
                        const sourcePath = file.path;

                        fsp.mkdir(path.dirname(destinationPath), { recursive: true }).then(() => {
                            if (fs.existsSync(destinationPath)) {
                                res();
                            }
                            fsp.copyFile(sourcePath, destinationPath)
                                .then(res)
                                .catch((err) => {
                                    console.warn(err);
                                });
                        });
                    }
                    break;
            }
        });
    }

    private getBrickadiaBuildPath() {
        return path.join(Runtime.omegga.savePath, path.basename(Runtime.path));
    }

    private getBrickadiaMinigamePath() {
        return path.join(Runtime.omegga.presetPath, "Minigame");
    }

    private getBrickadiaEnvironmentPath() {
        return path.join(Runtime.omegga.presetPath, "Environment");
    }
}
