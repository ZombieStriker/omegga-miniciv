import Runtime from "../../runtime/main";
import Deferred from "../deferred";
import Command from "./commands";

type UserContext = {
    defer: Deferred<string>;
    question: string[];
};

/**
 * Conversation API
 * Allows for easy use with contextual communication between players and plugins
 */
export default class Conversation {
    private username: string;
    private result: string = "";

    private static userContexts: { [username: string]: UserContext } = {};

    /**
     * This sets the player commands for communicating with the plugin through the conversations API.
     * @param responseCommandNames Command names that correlate to responding to conversations
     * @param yesCommandNames Command names that correlate to saying "yes" to conversations
     * @param noCommandNames Command names that correlate to saying "no" to conversations
     */
    public static setup(responseCommandNames?: string[], yesCommandNames?: string[], noCommandNames?: string[]) {
        for (let i = 0; i < responseCommandNames?.length; i++) {
            const name = responseCommandNames[i];
            new Command(name, (speaker: string, ...response: string[]) => {
                if (!(speaker in this.userContexts)) {
                    Runtime.omegga.whisper(speaker, "There is no context.");
                    return;
                }
                this.userContexts[speaker].defer.resolve(response.join(" "));
                delete this.userContexts[speaker];
            });
        }

        for (let i = 0; i < yesCommandNames?.length; i++) {
            const name = yesCommandNames[i];
            new Command(name, (speaker: string) => {
                if (!(speaker in this.userContexts)) {
                    Runtime.omegga.whisper(speaker, "There is no context.");
                    return;
                }
                this.userContexts[speaker].defer.resolve("yes");
                delete this.userContexts[speaker];
            });
        }

        for (let i = 0; i < noCommandNames?.length; i++) {
            const name = noCommandNames[i];
            new Command(name, (speaker: string) => {
                if (!(speaker in this.userContexts)) {
                    Runtime.omegga.whisper(speaker, "There is no context.");
                    return;
                }
                this.userContexts[speaker].defer.resolve("no");
                delete this.userContexts[speaker];
            });
        }
    }

    constructor(username: string) {
        this.username = username;
        delete Conversation.userContexts[this.username];
    }

    /**
     * Asks the player a question.
     * @param question This is shown to the player
     * @returns self
     */
    public query(question: string | string[]): Conversation {
        if (typeof question === "string") {
            question = [question];
        }

        Runtime.omegga.whisper(this.username, ...question);

        let response = new Deferred<string>();
        response.then((v) => {
            this.result = v;
        });

        Conversation.userContexts[this.username] = {
            defer: response,
            question: question,
        };

        return this;
    }

    /**
     * Filters out unwanted responses and automatically asks the player the question again upon unwanted responses.
     * @param predicate A function that takes the player's response string and returns a boolean. If true, we return the response, If false we ask the player again, with an optional hint.
     * @param player_hint The string a player is shown after the question, whenever predicate is false.
     * @returns promisified self
     */
    public async expect(predicate: (responce: string) => boolean, player_hint?: string): Promise<Conversation> {
        await new Promise((resolve) => {
            const defer = Conversation.userContexts[this.username].defer;
            const question = Conversation.userContexts[this.username].question;
            defer.then((response) => {
                this.result = response;
                if (predicate(response)) {
                    //this is acceptable.
                    resolve(response);
                } else {
                    //we don't want this, so ask again.
                    Runtime.omegga.whisper(this.username, ...question, player_hint);
                    let response = new Deferred<string>();

                    Conversation.userContexts[this.username] = {
                        defer: response,
                        question: question,
                    };

                    this.expect(predicate, player_hint).then((v) => resolve(v));
                }
            });
        });
        return this;
    }

    /**
     * Get the player response from the conversation monad
     * @returns string
     */
    public unwrap() {
        return this.result;
    }
}
