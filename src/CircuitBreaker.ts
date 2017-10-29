import { Command } from "./Command";
import Configuration from "./Configuration";
import Stats from "./Stats";

enum CircuitState {
    Opened,
    Closed
}

export class CircuitBreaker {
    private circuitState: CircuitState = CircuitState.Closed;
    private fallback: Command;
    private successful: number = 0;
    private failed: number = 0;

    constructor(config: Configuration) {
        this.fallback = config.fallback || (() => { throw new Error("Circuit opened.") });
    }

    public async execute(command: Command): Promise<any> {
        if (this.circuitState === CircuitState.Closed) {
            try {
                const result = await command();
                this.successful++;
                return result;
            } catch(e) {
                this.failed++;
                throw e;
            }
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

    public getStats(): Stats {
        return {
            successful: this.successful,
            failed: this.failed
        };
    }
}
