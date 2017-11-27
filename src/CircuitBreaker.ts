import { Command } from "./Command";
import Configuration from "./Configuration";
import TimeFrame from "./frame/TimeFrame";

export class CircuitBreaker {
    private isClosed: boolean = true;
    private fallback: Command;
    private timeFrame: TimeFrame;
    private errorThreshold: number;

    constructor(config: Configuration) {
        this.fallback = config.fallback || (() => { throw new Error("Circuit opened.") });
        this.errorThreshold = config.errorThreshold;

        this.timeFrame = new TimeFrame(config.timeFrameLength, config.numberOfBuckets);
    }

    public async execute(command: Command): Promise<any> {
        if (!this.shouldOpenCircuit()) {
            this.isClosed = true;
        }

        if (this.isClosed) {
            try {
                const result = await command();
                this.timeFrame.recordSuccess();
                return result;
            } catch (e) {
                this.timeFrame.recordFailure();

                if (this.shouldOpenCircuit()) {
                    this.forceOpen();
                }

                throw e;
            }
        } else {
            return this.fallback();
        }
    }

    public forceOpen() {
        this.isClosed = false;
    }

    public forceClose() {
        this.isClosed = true;
    }

    public isCircuitClosed(): boolean {
        return this.isClosed;
    }

    public getStats() {
        return this.timeFrame.getStats();
    }

    private shouldOpenCircuit() {
        return this.timeFrame.getStats().calculateErrorThreshold() >= this.errorThreshold;
    }
}
