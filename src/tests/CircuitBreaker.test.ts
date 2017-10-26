import {expect} from "chai";
import { CircuitBreaker } from "../CircuitBreaker";

describe("CircuitBreaker", () => {
    it("executes command", async () => {
        let executed = false;
        const breaker = new CircuitBreaker(null);

        await breaker.execute(async () => {
            executed = true;
        });

        expect(executed).to.equal(true);
    });
});
