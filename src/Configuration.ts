
import { Command } from "./Command";

export default interface IConfiguration {
    fallback?: Command;
    errorThreshold: number;
    timeFrameLength: number;
    numberOfBuckets: number;
}
