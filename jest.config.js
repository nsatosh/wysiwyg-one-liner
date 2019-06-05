module.exports = {
  preset: "jest-puppeteer",
  testEnvironment: "jsdom",
  transform: { "^.+\\.ts$": "ts-jest" },
  testMatch: ["<rootDir>/tests/**/*.test.ts?(x)"],
  moduleFileExtensions: ["js", "json", "jsx", "node", "ts"],
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tests/tsconfig.json"
    }
  }
};
