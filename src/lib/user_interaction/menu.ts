import Runtime from "src/runtime/main";

type UserData = {
    displayInterval: NodeJS.Timer;
};

/**
 * Menu API
 * Allows ease of use with repeated displaying of text on a player's middleprint.
 */
export default class Menu {
    private username: string;
    private screenBuffer: string;
    private id: NodeJS.Timer;

    private static userData: { [username: string]: UserData } = {};

    /**
     * Creates a menu that will automatically display its screen buffer on an interval
     * @param username The user the menu is assigned to.
     */
    constructor(username: string) {
        this.username = username;
        this.forceDispose();

        Menu.userData[this.username] = {
            displayInterval: setInterval(this.render.bind(this), 2500),
        };
        this.id = Menu.userData[this.username].displayInterval;
    }

    /**
     * Updates the menu screen buffer
     * @param screen_buffer A string that replaces the buffer.
     */
    public update(screen_buffer: string) {
        this.screenBuffer = screen_buffer;
    }

    /**
     * Displays the screen buffer
     */
    public render() {
        Runtime.omegga.middlePrint(this.username, this.screenBuffer);
    }

    /**
     * Disposes the menu.
     */
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
