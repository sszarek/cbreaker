import { expect } from "chai";
import { CircuitBreaker } from "../CircuitBreaker";
import Configuration from "../Configuration";
import { stub } from "sinon";

describe("CircuitBreaker", () => {
    describe("Circuit closed", () => {
        it("executes command", async () => {
            const commandStub = stub().resolves();
            const breaker = new CircuitBreaker({});

            await breaker.execute(commandStub);

            expect(commandStub.callCount).to.equal(1);
        });
    });

    describe("Circuit opened", () => {
        it("does not execute command but configured fallback", async () => {
            const commandStub = stub().resolves();
            const fallbackStub = stub().resolves();
            const breaker = new CircuitBreaker({
                fallback: fallbackStub
            });
            breaker.forceOpen();

            await breaker.execute(commandStub);

            expect(commandStub.callCount).to.equal(0);
            expect(fallbackStub.callCount).to.equal(1);
        });

        it("executes default fallback if not set", async () => {
            const commandStub = stub().resolves();
            const breaker = new CircuitBreaker({});
            breaker.forceOpen();

            try {
                await breaker.execute(commandStub);
            } catch (e) {
                expect(e.message).to.equal("Circuit opened.");
                return;
            }

            expect.fail(true, false, "Expected error to be thrown");
        });
    });
});