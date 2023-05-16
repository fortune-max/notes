export default {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testEnvironment: "node",
  testMatch: [
    "**/__test__/*.test.js",
  ],
};
