import OmeggaPlugin, { OL, PS, PC, Vector, WriteSaveObject, OmeggaPlayer} from 'omegga';

type Config = { foo: string };

const BRICK_SIZE = 20;

const colorGreen = "<color=\"0ccf00\">";
const colorYellow = "<color=\"00ffff\">";
const colorRed = "<color=\"ff3303\">";

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
    return { registeredCommands: [''] };
  }

  async stop() {
  }
}