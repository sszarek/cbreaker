import { Command } from "./Command";
import IConfiguration from "./Configuration";
import TimeFrame from "./frame/TimeFrame";
import CircuitOpenedError from "./CircuitOpenedError";
import Stats from "./frame/Stats";

export class CircuitBreaker {
    private isClosed: boolean = true;
    private timeFrame: TimeFrame;
    private errorThreshold: number;

    constructor(config: IConfiguration) {
        this.errorThreshold = config.errorThreshold;

        this.timeFrame = new TimeFrame(config.timeFrameLength, config.numberOfBuckets);
    }

    public async execute<T>(command: Command<T>): Promise<T | Error> {
        if (this.shouldCloseCirciuit()) {
            this.closeCircuit();
        }

        if (this.isClosed) {
            try {
                const result = await command();
                this.timeFrame.recordSuccess();
                return result;
            } catch (e) {
                this.timeFrame.recordFailure();

                if (this.shouldOpenCircuit()) {
                    this.openCircuit();
                }

                throw e;
            }
        } else {
            throw new CircuitOpenedError("Can not execute command. Circuit is opened.", this.timeFrame.getStats());
        }
    }

    public isCircuitClosed(): boolean {
        return this.isClosed;
    }

    public getStats() {
        return this.timeFrame.getStats();
    }

    private openCircuit() {
        this.isClosed = false;
    }

    private closeCircuit() {
        this.isClosed = true;
    }
    private shouldOpenCircuit() {
        return this.timeFrame.getStats().calculateErrorThreshold() >= this.errorThreshold;
    }

    private shouldCloseCirciuit()  {
        return !this.shouldOpenCircuit();
    }
}
