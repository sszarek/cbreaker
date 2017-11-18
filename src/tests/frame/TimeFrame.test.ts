import { expect } from "chai";
import TimeFrame from "../../frame/TimeFrame";
import { stub, useFakeTimers } from "sinon";

describe("TimeFrame", () => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        clock = useFakeTimers();
    });

    it("is immediately usable", () => {
        const frame = new TimeFrame(1000, 10);
        frame.recordSuccess();

        expect(frame.getStats()).to.be.deep.equal({
            successful: 1,
            failed: 0
        });
    });

    afterEach(() => {
        clock.restore();
    });
});