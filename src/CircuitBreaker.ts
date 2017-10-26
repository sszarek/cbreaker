import {Command} from "./Command";
import Configuration from "./Configuration";

export class CircuitBreaker {
    private config: Configuration;

    constructor(config: Configuration) {
        this.config = config;
    }

    public execute(command: Command): Promise<any> {
        return command();
    }
}
