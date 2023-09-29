import Runtime from "src/runtime/main";

type UserData = {
    displayInterval: NodeJS.Timer;
};

export default class Menu {
    private username: string;
    private screenBuffer: string;
    private id: NodeJS.Timer;

    private static userData: { [username: string]: UserData } = {};

    constructor(username: string) {
        this.username = username;
        this.forceDispose();

        Menu.userData[this.username] = {
            displayInterval: setInterval(this.render.bind(this), 2500),
        };
        this.id = Menu.userData[this.username].displayInterval;
    }

    public update(screen_buffer: string) {
        this.screenBuffer = screen_buffer;
    }

    public render() {
        Runtime.omegga.middlePrint(this.username, this.screenBuffer);
    }

    public dispose() {
        if (this.id !== Menu.userData[this.username].displayInterval) return;
        this.forceDispose();
    }

    private forceDispose() {
        if (!(this.username in Menu.userData)) return;
        Runtime.omegga.middlePrint(this.username, `<br>`);
        clearInterval(Menu.userData[this.username].displayInterval);
        delete Menu.userData[this.username];
    }
}
