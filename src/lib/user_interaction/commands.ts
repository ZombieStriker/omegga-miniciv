import Runtime from "../../runtime/main";

type Everyone = -1;
type AppliedRoles = string[] | Everyone;
type CommandOptions = {
    allowedRoles?: AppliedRoles;
    inversePermissions?: boolean;
};

export default class Command {
    private static listeners: { [name: string]: ((speaker: string, ...commandArgs: string[]) => void)[] } = {};

    public name: string;
    public affectedRoles: string[];
    public permissionMode: "Blacklist" | "Whitelist";
    public callback: (speaker: string, ...commandArgs: string[]) => void;

    constructor(name: string, callback: (speaker: string, ...commandArgs: string[]) => void, options?: CommandOptions) {
        this.name = name;
        this.callback = callback;

        if (options != null && options.allowedRoles != null && options.allowedRoles !== -1) {
            // Only some are allowed to use the command.
            this.affectedRoles = options.allowedRoles as string[];
            this.permissionMode = "Whitelist";
        } else {
            this.affectedRoles = [];
            this.permissionMode = "Blacklist";
        }

        if (options != null && options.inversePermissions === true) {
            this.permissionMode = this.permissionMode === "Whitelist" ? "Blacklist" : "Whitelist";
        }

        const listener = (speaker: string, ...args: string[]): void => {
            let player = Runtime.omegga.getPlayer(speaker);
            let authorized = this.permissionMode === "Whitelist" ? false : true;

            this.affectedRoles.forEach((affectedRole) => {
                if (player.getRoles().includes(affectedRole)) {
                    authorized = this.permissionMode === "Whitelist" ? true : false;
                }
            });

            if (!(player.isHost() || authorized)) {
                Runtime.omegga.whisper(speaker, "You do not have permission to use this command.");
                return;
            }

            callback(speaker, ...args);
        };
        Runtime.omegga.on(`cmd:${name}`, listener);

        if (!(name in Command.listeners)) Command.listeners[name] = [];
        Command.listeners[name].push(listener);
    }

    public static getListeners(): { [name: string]: ((speaker: string, ...commandArgs: string[]) => void)[] } {
        return Command.listeners;
    }
}
