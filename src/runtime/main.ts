import { Brick, OmeggaLike, PC, PS } from "omegga";
import { Config } from "omegga.plugin";
import BrickLoader from "src/lib/bricks/loader";
import MapGenerator from "src/lib/map/generator";
import Command from "src/lib/user_interaction/commands";

export default class Runtime {
    public static omegga: OmeggaLike;
    public static config: PC<Config>;
    public static store: PS<Storage>;

    public static async main(omegga: OmeggaLike, config: PC<Config>, store: PS<Storage>): Promise<void> {
        [this.omegga, this.config, this.store] = [omegga, config, store];

        new Command("generate", (speaker: string, size: string) => {
            const sizeInt = parseInt(size);
            if (!Number.isInteger(sizeInt)) {
                this.omegga.whisper(speaker, "Please enter a number for size.");
                return;
            }
            const map = MapGenerator.create([sizeInt, sizeInt]);

            MapGenerator.load(map);
        });
    }
}
