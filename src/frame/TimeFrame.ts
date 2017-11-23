import { timeout } from "../helpers";
import Bucket from "./Bucket";

export default class TimeFrame {
    private bucketLengthMs: number;
    private bucketsCnt: number;
    private buckets: Array<Bucket> = [];
    private activeBucket: Bucket;

    constructor(lengthMs: number, buckets: number) {
        this.bucketsCnt = buckets;
        this.bucketLengthMs = lengthMs / buckets;

        this.startMovingFrame();
    }

    private moveFrame = () => {
        if (this.buckets.length >= this.bucketsCnt) {
            this.removeBucket();
        }

        this.addBucket();
    }

    private async startMovingFrame() {
        this.addBucket();
        
        setInterval(this.moveFrame, this.bucketLengthMs);
    }

    private addBucket() {
        this.activeBucket = new Bucket();
        this.buckets.push(this.activeBucket);
    }

    private removeBucket() {
        this.buckets.shift();
    }

    public recordFailure() {
        this.activeBucket.failed++;
    }

    public recordSuccess() {
        this.activeBucket.successful++;
    }

    public getStats() {
        return this.buckets.reduce((acc, bucket) => {
            acc.failed += bucket.failed;
            acc.successful += bucket.successful;

            return acc;
        }, {
                successful: 0,
                failed: 0
            });
    }
}
