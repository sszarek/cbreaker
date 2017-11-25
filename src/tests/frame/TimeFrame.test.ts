import { expect } from "chai";
import TimeFrame from "../../frame/TimeFrame";
import { timeout } from "../../helpers";
import { stub, useFakeTimers } from "sinon";
import { setImmediate } from "timers";

describe("TimeFrame", () => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        clock = useFakeTimers();
    });

    it("is immediately usable", () => {
        const frame = new TimeFrame(200, 2);
        frame.recordSuccess();

        expect(frame.getStats()).to.be.deep.equal({
            successful: 1,
            failed: 0
        });
    });

    it("properly calculates stats within bucket time range", async () => {
        const frame = new TimeFrame(1000, 10);
        frame.recordSuccess();
        frame.recordSuccess();
        frame.recordFailure();
        clock.tick(500);

        expect(frame.getStats()).to.be.deep.equal({
            successful: 2,
            failed: 1
        });
    });

    it("removes data if falls out of time frame", async () => {
        const frame = new TimeFrame(200, 2);
        frame.recordSuccess();
        clock.tick(201);

        expect(frame.getStats()).to.be.deep.equal({
            successful: 0,
            failed: 0,
        });
    });

    it("removes only those data that falls out of time frame", async() => {
        const frame = new TimeFrame(1000, 10);
        frame.recordSuccess();
        clock.tick(100);
        frame.recordSuccess();
        frame.recordFailure();
        clock.tick(901);

        expect(frame.getStats()).to.be.deep.equal({
            successful: 1,
            failed: 1
        });
    });

    afterEach(() => {
        clock.restore();
    });
});