const temp = require("temp").track();
const util = require("util");
const fs = require("fs-extra");
const { writeJsonToDir } = require("../src");

const makeTempDir = () => util.promisify(temp.mkdir)("temp");
const readFile = async filePath => fs.readFile(filePath, "utf8");
const readDir = async dirPath => {
  const dirContents = await fs.readdir(dirPath);
  return dirContents.sort();
};

describe("writeJsonToDir", () => {
  afterEach(() => {
    temp.cleanupSync();
  });

  it("should write a one level deep directory", async () => {
    const tempPath = await makeTempDir();

    const dirAsJson = {
      "file1.js": "file1 content",
      "file2.json": "file2 content",
      "file3.wix": "file3 content"
    };

    await writeJsonToDir(tempPath, dirAsJson);

    expect(await readDir(tempPath)).toEqual([
      "file1.js",
      "file2.json",
      "file3.wix"
    ]);
    expect(await readFile(`${tempPath}/file1.js`)).toEqual("file1 content");
    expect(await readFile(`${tempPath}/file2.json`)).toEqual("file2 content");
    expect(await readFile(`${tempPath}/file3.wix`)).toEqual("file3 content");
  });

  it("should write a multi level deep directory", async () => {
    const tempPath = await makeTempDir();

    const dirAsJson = {
      "file1.js": "file1 content",
      level2: {
        "file2.json": "file2 content",
        level3: {
          "file3.wix": "file3 content"
        }
      }
    };

    await writeJsonToDir(tempPath, dirAsJson);

    expect(await readDir(tempPath)).toEqual(["file1.js", "level2"].sort());
    expect(await readDir(`${tempPath}/level2`)).toEqual([
      "file2.json",
      "level3"
    ]);
    expect(await readDir(`${tempPath}/level2/level3`)).toEqual(["file3.wix"]);

    expect(await readFile(`${tempPath}/file1.js`)).toEqual("file1 content");
    expect(await readFile(`${tempPath}/level2/file2.json`)).toEqual(
      "file2 content"
    );
    expect(await readFile(`${tempPath}/level2/level3/file3.wix`)).toEqual(
      "file3 content"
    );
  });

  it("should write empty directories", async () => {
    const tempPath = await makeTempDir();

    const dirAsJson = {
      "file1.js": "file1 content",
      "empty-dir": {}
    };

    await writeJsonToDir(tempPath, dirAsJson);

    expect(await readDir(tempPath)).toEqual(["file1.js", "empty-dir"].sort());
    expect(await readDir(`${tempPath}/empty-dir`)).toEqual([]);
    expect(await readFile(`${tempPath}/file1.js`)).toEqual("file1 content");
  });
});
