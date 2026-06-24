module.exports = {
  extends: ['../../.eslintrc.cjs'],
  ignorePatterns: ['prisma.config.ts'],
  parserOptions: {
    projectService: {
      allowDefaultProject: ['prisma.config.ts'],
    },
    tsconfigRootDir: __dirname,
  },
};
