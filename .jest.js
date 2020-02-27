module.exports = {
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
    ],
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testMatch: [
        "**/__tests__/**/*.test.ts?(x)",
        "**/__tests__/**/*.test.ts?(x)",
        "**/__tests__/*.test.ts?(x)"
    ],
    globals: {
        'ts-jest': {
            tsConfigFile: './tsconfig.test.json',
        }
    },
};
