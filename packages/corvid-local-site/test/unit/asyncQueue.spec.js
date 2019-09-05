const createQueue = require("../../src/utils/asyncQueue");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe("async queue", () => {
  it("should wrap a callback and allow to pass arguments to it and get its return value", async () => {
    const myQueue = createQueue();

    const asyncSum = async (...nums) => {
      await sleep(20);
      return nums.reduce((res, num) => res + num, 0);
    };
    const queuedSum = myQueue(asyncSum);

    const queuedResult = await queuedSum(1, 2, 3);
    expect(queuedResult).toBe(6);
  });

  it("should propogate errors thrown from the wrapped callback", async () => {
    const myQueue = createQueue();

    const asyncError = async message => {
      await sleep(20);
      throw new Error(`Error: ${message}`);
    };
    const queuedError = myQueue(asyncError);

    const queuedResult = queuedError("test error message");
    await expect(queuedResult).rejects.toThrow(
      new Error("Error: test error message")
    );
  });

  it("should run the same callback in a queue", async () => {
    const myQueue = createQueue();

    const results = [];
    const asyncAddResult = async (result, sleepTime) => {
      await sleep(sleepTime);
      results.push(result);
    };

    const queuedAddResult = myQueue(asyncAddResult);

    queuedAddResult("first", 1000);
    queuedAddResult("second", 200);
    await queuedAddResult("third", 5);

    expect(results).toEqual(["first", "second", "third"]);
  });

  it("should run multiple callbacks one after the other", async () => {
    const myQueue = createQueue();

    const results = [];
    const asyncAddResult = result => async sleepTime => {
      await sleep(sleepTime);
      results.push(result);
    };

    const queuedAddFirst = myQueue(asyncAddResult("first"));
    const queuedAddSecond = myQueue(asyncAddResult("second"));
    const queuedAddThird = myQueue(asyncAddResult("third"));

    queuedAddFirst(1000);
    queuedAddSecond(3);
    await queuedAddThird(40);

    expect(results).toEqual(["first", "second", "third"]);
  });

  it("should keep running queued callbacks even if failures happen", async () => {
    const myQueue = createQueue();

    const results = [];
    const asyncAddResult = async (result, sleepTime) => {
      await sleep(sleepTime);
      results.push(result);
    };

    const asyncReject = async (message, sleepTime) => {
      await sleep(sleepTime);
      throw new Error(message);
    };

    const queuedAddResult = myQueue(asyncAddResult);
    const queuedThrowError = myQueue(asyncReject);

    queuedAddResult("first", 400);
    const expectedRejection = queuedThrowError("second error", 10);
    const allDonePromise = queuedAddResult("third", 60);

    await expect(expectedRejection).rejects.toThrow(new Error("second error"));
    await allDonePromise;
    expect(results).toEqual(["first", "third"]);
  });
});
