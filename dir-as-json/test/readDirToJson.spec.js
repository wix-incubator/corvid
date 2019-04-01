const temp = require("temp").track();
const util = require("util");
const fs = require("fs-extra");
const { readDirToJson } = require("../src");

const makeTempDir = () => util.promisify(temp.mkdir)("temp");

const writeFile = async (filePath, content) => {
  await fs.ensureFile(filePath);
  await fs.writeFile(filePath, content);
};

describe("readDirToJson", () => {
  afterEach(() => {
    temp.cleanupSync();
  });

  it("should read a one level deep directory to json", async () => {
    const tempPath = await makeTempDir();
    await Promise.all([
      writeFile(`${tempPath}/file1.js`, "file1 content"),
      writeFile(`${tempPath}/file2.json`, "file2 content"),
      writeFile(`${tempPath}/file3.wix`, "file3 content")
    ]);

    const dirAsJson = await readDirToJson(tempPath);
    expect(dirAsJson).toEqual({
      "file1.js": "file1 content",
      "file2.json": "file2 content",
      "file3.wix": "file3 content"
    });
  });

  it("should read a multi level deep directory to json", async () => {
    const tempPath = await makeTempDir();

    await Promise.all([
      writeFile(`${tempPath}/file1.js`, "file1 content"),
      writeFile(`${tempPath}/level2/file2.js`, "file2 content"),
      writeFile(`${tempPath}/level2/level3/file3.js`, "file3 content")
    ]);

    const dirAsJson = await readDirToJson(tempPath);
    expect(dirAsJson).toEqual({
      "file1.js": "file1 content",
      level2: {
        "file2.js": "file2 content",
        level3: {
          "file3.js": "file3 content"
        }
      }
    });
  });

  it("should read empty directories", async () => {
    const tempPath = await makeTempDir();

    await Promise.all([
      writeFile(`${tempPath}/file1.js`, "file1 content"),
      fs.ensureDir(`${tempPath}/empty-dir`)
    ]);

    const dirAsJson = await readDirToJson(tempPath);
    expect(dirAsJson).toEqual({
      "file1.js": "file1 content",
      "empty-dir": {}
    });
  });
});
