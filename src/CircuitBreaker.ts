import { Command } from "./Command";
import Configuration from "./Configuration";

enum CircuitState {
    Opened,
    Closed
}

export class CircuitBreaker {
    private circuitState: CircuitState = CircuitState.Closed;
    private fallback: Command;

    constructor(config: Configuration) {
        this.fallback = config.fallback || (() => { throw new Error("Circuit opened.") });
    }

    public async execute(command: Command): Promise<any> {
        if (this.circuitState === CircuitState.Closed) {
            return command();
        } else {
            return this.fallback();
        }
    }

    public forceOpen() {
        this.circuitState = CircuitState.Opened;
    }

    public forceClose() {
        this.circuitState = CircuitState.Closed;
    }
}
