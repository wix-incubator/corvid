const fs = require("fs-extra");
const path = require("path");
const eventually = require("@wix/wix-eventually");
const { withClose } = require("@wix/wix-code-local-test-utils");
const makeTempDir = require("../utils/makeTempDir");
const watch = withClose.add(require("../../src/watcher"));

afterEach(withClose.closeAll);

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
    });
  });

  describe("ignoredWriteFile", () => {
    it("should not trigger a file add event", async () => {
      const rootPath = await makeTempDir();
      const addHandler = jest.fn();
      const watcher = await watch(rootPath);
      const relativeFilePath = "test-file.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);

      watcher.onAdd(addHandler);
      await watcher.ignoredWriteFile("test-file-2.js", "some test code");

      // writing to this file in order to verify that add of the other file was not caught
      await fs.writeFile(fullFilePath, "some code");
      await eventually(
        () => {
          expect(addHandler).toHaveBeenCalledTimes(1);
          expect(addHandler).toHaveBeenCalledWith(
            relativeFilePath,
            "some code"
          );
        },
        { timeout: 3000 }
      );

      await watcher.close();
    });
    it("should not trigger a change event on add of a new file", async () => {
      const rootPath = await makeTempDir();
      const addHandler = jest.fn();
      const changeHandler = jest.fn();
      const watcher = await watch(rootPath);
      const relativeFilePath = "test-file.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);

      watcher.onAdd(addHandler);
      watcher.onChange(changeHandler);
      await watcher.ignoredWriteFile("test-file-2.js", "some test code");
      await fs.writeFile(fullFilePath, "some code");
      await eventually(
        () => {
          expect(addHandler).toHaveBeenCalledTimes(1);
          expect(addHandler).toHaveBeenCalledWith(
            relativeFilePath,
            "some code"
          );
          expect(changeHandler).toHaveBeenCalledTimes(0);
        },
        { timeout: 3000 }
      );

      await watcher.close();
    });
    it("should not trigger a change event on changing of an existing file", async () => {
      const rootPath = await makeTempDir();
      const changeHandler = jest.fn();
      const relativeFilePath = "test-file.js";
      const relativeFilePath2 = "test-file-2.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);
      const fullFilePath2 = path.join(rootPath, relativeFilePath2);
      await fs.writeFile(fullFilePath, "some code");
      await fs.writeFile(fullFilePath2, "some code 2");

      const watcher = await watch(rootPath);
      watcher.onChange(changeHandler);
      await watcher.ignoredWriteFile(
        relativeFilePath,
        "this should be ignored"
      );
      await fs.writeFile(fullFilePath2, "this should be caught");

      await eventually(
        () => {
          expect(changeHandler).toHaveBeenCalledTimes(1);
          expect(changeHandler).toHaveBeenCalledWith(
            relativeFilePath2,
            "this should be caught"
          );
        },
        { timeout: 4000 }
      );

      await watcher.close();
    });
  });

  describe("ignoredDeleteFile", () => {
    it("should not notify about a deleted file", async () => {
      const rootPath = await makeTempDir();
      const relativeFilePath = "test-file.js";
      const relativeFilePath2 = "test-file-2.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);
      const fullFilePath2 = path.join(rootPath, relativeFilePath2);
      await fs.writeFile(fullFilePath, "some code");
      await fs.writeFile(fullFilePath2, "some test code");

      const watcher = await watch(rootPath);

      const deleteHandler = jest.fn();
      watcher.onDelete(deleteHandler);

      await fs.unlink(fullFilePath);
      await watcher.ignoredDeleteFile(relativeFilePath2);
      await eventually(
        () => {
          expect(deleteHandler).toHaveBeenCalledTimes(1);
          expect(deleteHandler).toHaveBeenCalledWith(relativeFilePath);
        },
        { timeout: 3000 }
      );
      await watcher.close();
    });
  });

  describe("ignoredCopyFile", () => {
    it("should not trigger an add event on copying of an existing file", async () => {
      const rootPath = await makeTempDir();
      const addHandler = jest.fn();
      const relativeFilePath = "test-file.js";
      const relativeFileCopyPath = "test-file-copy.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);
      await fs.writeFile(fullFilePath, "some code");

      const watcher = await watch(rootPath);
      watcher.onAdd(addHandler);

      await watcher.ignoredCopyFile(relativeFilePath, "test-file-2.js");
      await fs.copyFile(
        fullFilePath,
        path.join(rootPath, relativeFileCopyPath)
      );
      await eventually(
        () => {
          expect(addHandler).toHaveBeenCalledTimes(1);
          expect(addHandler).toHaveBeenCalledWith(
            relativeFileCopyPath,
            "some code"
          );
        },
        { timeout: 3000 }
      );

      await watcher.close();
    });
  });
});
