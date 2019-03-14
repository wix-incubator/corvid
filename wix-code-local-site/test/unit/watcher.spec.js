const fs = require("fs-extra");
const path = require("path");
const eventually = require("@wix/wix-eventually");
const makeTempDir = require("../utils/makeTempDir");
const watch = require("../../src/watcher");

describe("watcher", () => {
  describe("onAdd", () => {
    it("should notify about a new file", async () => {
      const rootPath = await makeTempDir();
      const relativeFilePath = "test-file.js";

      const watcher = await watch(rootPath);

      const addHandler = jest.fn();
      watcher.onAdd(addHandler);

      await fs.writeFile(path.join(rootPath, relativeFilePath), "some code");

      await eventually(() => {
        expect(addHandler).toHaveBeenCalledTimes(1);
        expect(addHandler).toHaveBeenCalledWith(relativeFilePath, "some code");
      });

      await watcher.close();
    });
  });

  describe("onChange", () => {
    it("should notify about a changed file", async () => {
      const rootPath = await makeTempDir();
      const relativeFilePath = "test-file.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);

      await fs.writeFile(fullFilePath, "old code");

      const watcher = await watch(rootPath);

      const changeHandler = jest.fn();
      watcher.onChange(changeHandler);

      await fs.writeFile(fullFilePath, "new code");

      await eventually(() => {
        expect(changeHandler).toHaveBeenCalledTimes(1);
        expect(changeHandler).toHaveBeenCalledWith(
          relativeFilePath,
          "new code"
        );
      });

      await watcher.close();
    });
  });

  describe("onDelete", () => {
    it("should notify about a deleted file", async () => {
      const rootPath = await makeTempDir();
      const relativeFilePath = "test-file.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);

      await fs.writeFile(fullFilePath, "some code");

      const watcher = await watch(rootPath);

      const deleteHandler = jest.fn();
      watcher.onDelete(deleteHandler);

      await fs.unlink(fullFilePath);

      await eventually(() => {
        expect(deleteHandler).toHaveBeenCalledTimes(1);
        expect(deleteHandler).toHaveBeenCalledWith(relativeFilePath);
      });

      await watcher.close();
    });
  });

  // describe("ignoredWriteFile", () => {
  //   it("should not notify about a new file", async () => {
  //     // TODO: implement
  //   });

  //   it("should not notify about a changed file", async () => {
  //     // TODO: implement
  //   });
  // });

  // describe("ignoredDeleteFile", () => {});

  // describe("ignoredCopyFile", () => {});
});
