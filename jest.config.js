module.exports = {
  preset: "jest-puppeteer",
  transform: { "^.+\\.tsx?$": "ts-jest" },
  testMatch: ["<rootDir>/tests/**/*.test.[jt]s?(x)"],
  moduleFileExtensions: ["js", "ts", "tsx"],
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tests/tsconfig.json"
    }
  }
};
