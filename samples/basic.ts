import {CircuitBreaker, Command} from "../index";

const requestCommand: Command = async () => {
    return "Hello world";
};

const breaker = new CircuitBreaker(null);
const repsonse = breaker.execute(requestCommand);
