describe("Code Completion", () => {
  describe("tsconfig", () => {
    describe("perform clone command", () => {
      it("should add tsconfig file to the backend root folder", async () => {});
      it("should add tsconfig file to the public root folder", async () => {});
      it("should add tsconfig file to every page folders", async () => {});
      it("should add tsconfig file to every lightbox folders", async () => {});
      it("should add tsconfig file to site folder", async () => {});
    });
    describe("perform edit command", () => {
      describe("page deleted from the editor and local saved", () => {
        it("should delete the root page folder", async () => {});
      });
      describe("page renamed from the editor and local saved", () => {
        it("should move the tsconfig file to the new root page folder", async () => {});
      });
      describe("page created from the editor and local saved", () => {
        it("should add a tsconfig file to the new root page folder", async () => {});
      });
    });
  });
});
