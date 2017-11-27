import { expect } from "chai";
import { CircuitBreaker } from "../CircuitBreaker";
import Configuration from "../Configuration";
import { stub, useFakeTimers } from "sinon";
import { equal } from "assert";
import { assertStatsEqual } from "./utils";

const defaultConfig: Configuration = {
    errorThreshold: 50,
    timeFrameLength: 100,
    numberOfBuckets: 10
}

describe("CircuitBreaker", () => {
    describe("Circuit closed", () => {
        let clock: sinon.SinonFakeTimers;

        beforeEach(() => {
            clock = useFakeTimers();
        });

        it("executes command", async () => {
            const commandStub = stub().resolves();
            const breaker = new CircuitBreaker(defaultConfig);

            await breaker.execute(commandStub);

            expect(commandStub.callCount).to.equal(1);
        });

        afterEach(() => {
            clock.restore();
        });
    });

    describe("Circuit opened", () => {
        let clock: sinon.SinonFakeTimers;

        beforeEach(() => {
            clock = useFakeTimers();
        })

        afterEach(() => {
            clock.restore();
        })
    });

    describe("Counting failed and successful commands", () => {
        let clock: sinon.SinonFakeTimers;

        beforeEach(() => {
            clock = useFakeTimers();
        });

        it("counts successfult command", async () => {
            const commandStub = stub().resolves();
            const breaker = new CircuitBreaker(defaultConfig);

            await breaker.execute(commandStub);

            assertStatsEqual(breaker.getStats(), {
                successful: 1,
                failed: 0
            });
        });

        it("counts failed commands", async () => {
            const commandStub = stub().rejects();
            const breaker = new CircuitBreaker(defaultConfig);

            try {
                await breaker.execute(commandStub);
            } catch (e) {

            } finally {
                assertStatsEqual(breaker.getStats(), {
                    successful: 0,
                    failed: 1
                });
            }
        });

        it("should reset data after time frame ends", async () => {
            const commandStub = stub().rejects();
            const breaker = new CircuitBreaker(defaultConfig);

            try {
                await breaker.execute(commandStub);
            } catch (e) {

            } finally {
                clock.tick(110);
                assertStatsEqual(breaker.getStats(), {
                    successful: 0,
                    failed: 0
                });
            }
        });

        afterEach(() => {
            clock.restore();
        });
    });

    describe("Reacting to failures", () => {
        let clock: sinon.SinonFakeTimers;

        beforeEach(() => {
            clock = useFakeTimers();
        });

        it("opens the circuit if error count exceeds the threshold", async () => {
            const commandStub = stub().rejects();
            const breaker = new CircuitBreaker(defaultConfig);

            try {
                await breaker.execute(commandStub);
            } catch (e) {

            } finally {
                expect(breaker.isCircuitClosed()).to.be.false;
            }
        });

        it("closes the circuit if error count drops below threshold" , async () => {
            const failedCommandStub = stub().rejects();
            const successfulCommandStub = stub().resolves();
            const breaker = new CircuitBreaker({
                errorThreshold: 10,
                timeFrameLength: 100,
                numberOfBuckets: 10
            });

            try {
                await breaker.execute(failedCommandStub);
            } catch (e) {
                
            } finally {
                clock.tick(101);
                await breaker.execute(successfulCommandStub);
                expect(breaker.isCircuitClosed()).to.be.true;
            }
        });

        afterEach(() => {
            clock.restore();
        });
    });
});
