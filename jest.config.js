// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'json', 'text', 'lcov', 'clover'],
  // modulePathIgnorePatterns: ['<rootDir>/src/Renderer/Shaders/GLSLFiles/'],
  moduleNameMapper: {
    '\\.(frag.glsl|vert.glsl|glsl|vert|frag)$': '<rootDir>/__mocks__/fileMock.js',
  },
}
