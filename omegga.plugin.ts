import OmeggaPlugin, { OL, PS, PC, Vector, WriteSaveObject, OmeggaPlayer } from "omegga";
import Command from "src/lib/user_interaction/commands";
import Runtime from "src/runtime/main";

export type Config = { foo: string };

const colorGreen = '<color="0ccf00">';
const colorYellow = '<color="00ffff">';
const colorRed = '<color="ff3303">';

export default class Plugin implements OmeggaPlugin<Config, Storage> {
    omegga: OL;
    config: PC<Config>;
    store: PS<Storage>;

    constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
        this.omegga = omegga;
        this.config = config;
        this.store = store;
    }

    async init() {
        Runtime.main(this.omegga, this.config, this.store);
        return { registeredCommands: Object.keys(Command.getListeners()) };
    }

    async stop() {}
}
