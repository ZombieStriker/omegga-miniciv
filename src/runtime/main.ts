import { OmeggaLike, PC, PS } from "omegga";
import { Config } from "omegga.plugin";
import path from "path";
import BrickadiaContentSync from "src/lib/file_management/brickadia_content_sync";
import MapGenerator from "src/lib/map/generator";
import Command from "src/lib/user_interaction/commands";
import ConversationInterface from "src/lib/user_interaction/conversation";
import Menu from "src/lib/user_interaction/menu";

export default class Runtime {
    public static omegga: OmeggaLike;
    public static config: PC<Config>;
    public static store: PS<Storage>;
    public static path: string = path.join(__dirname, "..");
    public static brickadiaData = new BrickadiaContentSync(path.join(this.path, "data"));

    public static async main(omegga: OmeggaLike, config: PC<Config>, store: PS<Storage>): Promise<void> {
        [this.omegga, this.config, this.store] = [omegga, config, store];

        ConversationInterface.setup(["respond", "r"], {
            yes: ["yes", "y"],
            no: ["no", "n"],
        });

        new Command("menu-test", (speaker: string) => {
            const menu = new Menu(speaker);
            menu.update("Hello, Menu!");
            menu.render();
            setTimeout(() => {
                menu.update("This is pretty neat, huh?");
            }, 2000);
            setTimeout(() => {
                menu.update("Menus are awesome!");
            }, 4500);
            setTimeout(() => {
                menu.update(`<font="RobotoMono">You can even use </><br> <size="40"><b><color="FF0000">rich</> <color="00FFFF">text</>!</></>`);
            }, 7000);
            setTimeout(() => {
                menu.dispose();
            }, 10000);
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
