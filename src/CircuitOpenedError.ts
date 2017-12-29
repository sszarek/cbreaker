import Stats from "./frame/Stats";

export default class CircuitOpenedError extends Error {
    public stats: Stats;

    constructor(message: string, stats: Stats) {
        super(message);
        this.name = "CircuitOpenedError";
        this.stats = stats;
    }
}
