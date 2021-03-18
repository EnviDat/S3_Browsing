module.exports = {
  presets: [
    [
      '@vue/cli-plugin-babel/preset',
      // '@babel/preset-env', { targets: { node: 'current' } },
    ],
  ],
  env: {
    test: {
      plugins: [
        'require-context-hook',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        '@babel/plugin-proposal-optional-chaining',
      ],
    },
  },  
};
