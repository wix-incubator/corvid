const fs = require("fs-extra");
const path = require("path");
const eventually = require("wix-eventually");
const { withClose, initTempDir } = require("corvid-local-test-utils");
const watch = withClose.add(require("../../src/watcher"));

afterEach(withClose.closeAll);

describe("watcher", () => {
  describe("onAdd", () => {
    it("should notify about a new file", async () => {
      const rootPath = await initTempDir();
      const relativeFilePath = "public/test-file.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);
      const watcher = await watch(rootPath);

      const addHandler = jest.fn();
      watcher.onAdd(addHandler);
      await fs.ensureFile(fullFilePath);
      await fs.writeFile(fullFilePath, "some code");

      await eventually(() => {
        expect(addHandler).toHaveBeenCalledTimes(1);
        expect(addHandler).toHaveBeenCalledWith(relativeFilePath, "some code");
      });
      await watcher.close();
    });
  });

  describe("onChange", () => {
    it("should notify about a changed file", async () => {
      const rootPath = await initTempDir();
      const relativeFilePath = "public/test-file.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);

      await fs.ensureFile(fullFilePath);
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
      const rootPath = await initTempDir();
      const relativeFilePath = "public/test-file.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);
      const deleteHandler = jest.fn();

      await fs.ensureFile(fullFilePath);
      await fs.writeFile(fullFilePath, "some code");
      const watcher = await watch(rootPath);

      watcher.onDelete(deleteHandler);
      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
      await fs.unlink(fullFilePath);

      await eventually(
        () => {
          expect(deleteHandler).toHaveBeenCalledTimes(1);
          expect(deleteHandler).toHaveBeenCalledWith(relativeFilePath);
        },
        {
          timeout: 3000
        }
      );

      await watcher.close();
    });
  });

  describe("ignoredWriteFile", () => {
    it("should not trigger a file add event", async () => {
      const rootPath = await initTempDir();
      const addHandler = jest.fn();
      const watcher = await watch(rootPath);
      const relativeFilePath = "public/test-file.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);

      watcher.onAdd(addHandler);
      await watcher.ignoredWriteFile("public/test-file-2.js", "some test code");

      // writing to this file in order to verify that add of the other file was not caught
      await fs.ensureFile(fullFilePath);
      await fs.writeFile(fullFilePath, "some code");
      await eventually(() => {
        expect(addHandler).toHaveBeenCalledTimes(1);
        expect(addHandler).toHaveBeenCalledWith(relativeFilePath, "some code");
      });

      await watcher.close();
    });
    it("should not trigger a change event on add of a new file", async () => {
      const rootPath = await initTempDir();
      const addHandler = jest.fn();
      const changeHandler = jest.fn();
      const watcher = await watch(rootPath);
      const relativeFilePath = "public/test-file.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);

      watcher.onAdd(addHandler);
      watcher.onChange(changeHandler);
      await watcher.ignoredWriteFile("public/test-file-2.js", "some test code");
      await fs.ensureFile(fullFilePath);
      await fs.writeFile(fullFilePath, "some code");
      await eventually(() => {
        expect(addHandler).toHaveBeenCalledTimes(1);
        expect(addHandler).toHaveBeenCalledWith(relativeFilePath, "some code");
        expect(changeHandler).toHaveBeenCalledTimes(0);
      });

      await watcher.close();
    });
    it("should not trigger a change event on changing of an existing file", async () => {
      const rootPath = await initTempDir();
      const changeHandler = jest.fn();
      const relativeFilePath = "public/test-file.js";
      const relativeFilePath2 = "public/test-file-2.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);
      const fullFilePath2 = path.join(rootPath, relativeFilePath2);
      await fs.ensureFile(fullFilePath);
      await fs.writeFile(fullFilePath, "some code");
      await fs.ensureFile(fullFilePath2);
      await fs.writeFile(fullFilePath2, "some code 2");

      const watcher = await watch(rootPath);
      watcher.onChange(changeHandler);
      await watcher.ignoredWriteFile(
        relativeFilePath,
        "this should be ignored"
      );
      await fs.writeFile(fullFilePath2, "this should be caught");

      await eventually(() => {
        expect(changeHandler).toHaveBeenCalledTimes(1);
        expect(changeHandler).toHaveBeenCalledWith(
          relativeFilePath2,
          "this should be caught"
        );
      });

      await watcher.close();
    });
  });

  describe("ignoredDeleteFile", () => {
    it("should not notify about a deleted file", async () => {
      const rootPath = await initTempDir();
      const relativeFilePath = "public/test-file.js";
      const relativeFilePath2 = "public/test-file-2.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);
      const fullFilePath2 = path.join(rootPath, relativeFilePath2);
      await fs.ensureFile(fullFilePath);
      await fs.writeFile(fullFilePath, "some code");
      await fs.ensureFile(fullFilePath2);
      await fs.writeFile(fullFilePath2, "some test code");

      const watcher = await watch(rootPath);

      const deleteHandler = jest.fn();
      watcher.onDelete(deleteHandler);

      await fs.unlink(fullFilePath);
      await watcher.ignoredDeleteFile(relativeFilePath2);

      await eventually(() => {
        expect(deleteHandler).toHaveBeenCalledTimes(1);
        expect(deleteHandler).toHaveBeenCalledWith(relativeFilePath);
      });
      await watcher.close();
    });
  });

  describe("ignoredCopyFile", () => {
    it("should not trigger an add event on copying of an existing file", async () => {
      const rootPath = await initTempDir();
      const addHandler = jest.fn();
      const relativeFilePath = "public/test-file.js";
      const relativeFileCopyPath = "public/test-file-copy.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);
      await fs.ensureFile(fullFilePath);
      await fs.writeFile(fullFilePath, "some code");

      const watcher = await watch(rootPath);
      watcher.onAdd(addHandler);

      await watcher.ignoredCopyFile(relativeFilePath, "test-file-2.js");
      await fs.copyFile(
        fullFilePath,
        path.join(rootPath, relativeFileCopyPath)
      );
      await eventually(() => {
        expect(addHandler).toHaveBeenCalledTimes(1);
        expect(addHandler).toHaveBeenCalledWith(
          relativeFileCopyPath,
          "some code"
        );
      });

      await watcher.close();
    });
  });

  describe("ignoredDeleteFolder", () => {
    it("should not notify about a deleted files in ignored folder", async () => {
      const rootPath = await initTempDir();
      const relativeFilePath = "public/test-file.js";
      const relativeFilePath2 = "public/toDelete/test-file-2.js";
      const fullFilePath = path.join(rootPath, relativeFilePath);
      const fullFilePath2 = path.join(rootPath, relativeFilePath2);
      await fs.ensureFile(fullFilePath);
      await fs.writeFile(fullFilePath, "some code");
      await fs.ensureFile(fullFilePath2);
      await fs.writeFile(fullFilePath2, "some test code");

      const watcher = await watch(rootPath);

      const deleteHandler = jest.fn();
      watcher.onDelete(deleteHandler);

      await watcher.ignoredDeleteFolder("public/toDelete");
      await fs.unlink(fullFilePath);

      await eventually(() => {
        expect(deleteHandler).toHaveBeenCalledTimes(1);
        expect(deleteHandler).toHaveBeenCalledWith(relativeFilePath);
        expect(fs.existsSync(fullFilePath2)).toBe(false);
      });
      await watcher.close();
    });
  });
});
