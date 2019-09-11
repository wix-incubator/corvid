const getPageElementsTypeDeclarations = elementsMap =>
  "type PageElementsMap = {\n" +
  Object.keys(elementsMap)
    .map(nickname => `  "#${nickname}": ${elementsMap[nickname]};\n`)
    .join("") +
  "}";

module.exports = {
  configPaths: {
    page: "corvid-types/configs/tsconfig.pages.json",
    backend: "corvid-types/configs/tsconfig.backend.json",
    public: "corvid-types/configs/tsconfig.public.json"
  },
  getPageElementsTypeDeclarations
};
