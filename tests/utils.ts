import { expect } from "chai";
import Stats from "../src/frame/Stats";

export const assertStatsEqual = (actual: Stats, expected: {successful: number, failed: number}) => {
    expect(actual.successful).to.be.equal(expected.successful);
    expect(actual.failed).to.be.equal(expected.failed);
};