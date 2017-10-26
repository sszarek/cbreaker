import Configuration from "./Configuration";
import {Command} from "./ICommand";

export class CircuitBreaker {
    private config: Configuration;

    constructor(config: Configuration) {
        this.config = config;
    }

    public execute(command: Command): Promise<any> {
        return command();
    }
}
