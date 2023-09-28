import { OmeggaLike, PC, PS } from "omegga";
import { Config } from "omegga.plugin";
import MapGenerator from "src/lib/map/generator";
import Command from "src/lib/user_interaction/commands";
import ConversationInterface from "src/lib/user_interaction/conversation";

export default class Runtime {
    public static omegga: OmeggaLike;
    public static config: PC<Config>;
    public static store: PS<Storage>;

    public static async main(omegga: OmeggaLike, config: PC<Config>, store: PS<Storage>): Promise<void> {
        [this.omegga, this.config, this.store] = [omegga, config, store];

        ConversationInterface.setup(["response", "r"], {
            yes: ["yes", "y"],
            no: ["no", "n"],
        });

        new Command("start-game", async (speaker: string) => {
            const conversation = new ConversationInterface(speaker);

            let worldSizeResponse = (
                await conversation
                    .query(["What size world do you want?", "Small, Standard, Large, Huge"])
                    .expect(
                        (responce) =>
                            responce.toLowerCase() === "small" ||
                            responce.toLowerCase() === "standard" ||
                            responce.toLowerCase() === "large" ||
                            responce.toLowerCase() === "huge",
                        "Use ''/r''"
                    )
            ).unwrap();

            const worldSize = (() => {
                switch (worldSizeResponse) {
                    case "small":
                        return 100;
                    case "standard":
                        return 150;
                    case "large":
                        return 200;
                    case "huge":
                        return 250;
                }
            })();

            const map = MapGenerator.create([worldSize, worldSize / 2], Math.random() * 0.6 + 0.2);

            MapGenerator.load(map);
        });
    }
}
