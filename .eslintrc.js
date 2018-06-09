// Ref: http://eslint.org/docs/rules/
// Please keep the rules in alphabetical order
module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "root": true,
  "plugins": ["node"],
  "extends": ["eslint:recommended", "plugin:node/recommended"],
  "rules": {
    "block-spacing": [
      "error",
      "always"
    ],
    "comma-spacing": [
      "error",
      { "before": false, "after": true }
    ],
    "curly": [
      "error",
      "all"
    ],
    "eqeqeq": [
      "error",
      "smart"
    ],
    "indent": [
      "error",
      2,
      { "SwitchCase": 1 }
    ],
    "key-spacing": [
      "error"
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "max-len": [
      "warn",
      { "code": 120 }
    ],
    "no-console": [
      "warn"
    ],
    "no-multi-spaces": [
      "error"
    ],
    "no-unreachable": [
      "error"
    ],
    "no-unused-vars": [
      "error",
      { "vars": "all", "args": "after-used" }
    ],
    "object-curly-spacing": [
      "error",
      "always"
    ],
    "prefer-const": [
      "error"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "quote-props": [
      "error",
      "consistent-as-needed",
    ],
    "semi": [
      "error",
      "always"
    ],
    "space-before-blocks": [
      "error",
      { "functions": "always", "keywords": "always" }
    ],
    "space-infix-ops": [
      "error"
    ]
  }
};
