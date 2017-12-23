export default class Stats {
    public successful: number = 0;
    public failed: number = 0;
    public calculateErrorThreshold() {
        const sum = this.failed + this.successful;

        return sum ? (this.failed * 100) / sum : 0;
    }
}
