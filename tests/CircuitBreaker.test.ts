import { expect } from "chai";
import { stub, useFakeTimers } from "sinon";
import { equal } from "assert";
import { assertStatsEqual } from "./utils";
import { CircuitBreaker } from "../src/CircuitBreaker";
import CircuitOpenedError from "../src/CircuitOpenedError";
import IConfiguration from "../src/Configuration";

const defaultConfig: IConfiguration = {
    errorThreshold: 50,
    timeFrameLength: 100,
    numberOfBuckets: 10,
};

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

            expect(commandStub).to.have.been.calledOnce;
        });

        afterEach(() => {
            clock.restore();
        });
    });

    describe("Circuit opened", () => {
        let clock: sinon.SinonFakeTimers;
        let breaker: CircuitBreaker;

        // Executes failing Command in order to open the circuit
        const openCircuit = async (breaker: CircuitBreaker) => {
            try {
                await breaker.execute(async () => { throw new Error('Some error') });
            } catch (e) {
            }
        };

        beforeEach(async () => {
            clock = useFakeTimers();
            breaker = new CircuitBreaker({
                errorThreshold: 10,
                timeFrameLength: 100,
                numberOfBuckets: 10
            });

            await openCircuit(breaker);
        });

        it("throws CircuitOpenedError", async () => {
            const commandStub = stub().resolves();

            await expect(breaker.execute(commandStub))
                .to.eventually.be.rejectedWith(Error, "Can not execute command. Circuit is opened.");
        });

        it("does not execute command", async () => {
            const commandStub = stub().resolves();

            await expect(breaker.execute(commandStub)).to.be.rejected;
            expect(commandStub).to.have.not.been.called;
        });

        afterEach(() => {
            clock.restore();
        });
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
                failed: 0,
            });
        });

        it("counts failed commands", async () => {
            const commandStub = stub().rejects();
            const breaker = new CircuitBreaker(defaultConfig);

            await expect(breaker.execute(commandStub)).to.be.rejected;
            assertStatsEqual(breaker.getStats(), {
                successful: 0,
                failed: 1
            });
        });

        it("should reset data after time frame ends", async () => {
            const commandStub = stub().rejects();
            const breaker = new CircuitBreaker(defaultConfig);

            await expect(breaker.execute(commandStub)).to.be.rejected;
            clock.tick(110);
            
            assertStatsEqual(breaker.getStats(), {
                successful: 0,
                failed: 0,
            });
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

            await expect(breaker.execute(commandStub)).to.be.rejected;
            expect(breaker.isCircuitClosed()).to.be.false;
        });

        it("closes the circuit if error count drops below threshold", async () => {
            const failedCommandStub = stub().rejects();
            const successfulCommandStub = stub().resolves();
            const breaker = new CircuitBreaker({
                errorThreshold: 10,
                timeFrameLength: 100,
                numberOfBuckets: 10
            });

            await expect(breaker.execute(failedCommandStub)).to.be.rejected;
            
            clock.tick(101);
            
            await breaker.execute(successfulCommandStub);
            expect(breaker.isCircuitClosed()).to.be.true;
        });

        afterEach(() => {
            clock.restore();
        });
    });
});
