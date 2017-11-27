
import { Command } from "./Command";

export default interface Configuration {
    fallback?: Command;
    errorThreshold: number,
    timeFrameLength: number,
    numberOfBuckets: number
}
