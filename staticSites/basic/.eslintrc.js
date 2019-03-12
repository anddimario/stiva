module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'plugin:vue/recommended',
    'plugin:node/recommended'
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
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
}
