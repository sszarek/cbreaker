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
        const frame = new TimeFrame(200, 2);
        frame.recordSuccess();
        clock.tick(100);

        expect(frame.getStats()).to.be.deep.equal({
            successful: 1,
            failed: 0
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

    afterEach(() => {
        clock.restore();
    });
});