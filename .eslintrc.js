module.exports = {
    extends: [
      'next',
      'next/core-web-vitals',
    ],
    rules: {
      // Add any custom rules here
      'react/prop-types': 'off', // Disable prop-types validation (if using TypeScript)
      'no-unused-vars': 'warn',   // Warn about unused variables
      'react/no-unescaped-entities': 'off', // Allow unescaped entities in JSX
    },
  };