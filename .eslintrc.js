const rules = {
  "indent": [
    "error",
    2,
    { "SwitchCase": 1 }
  ],
  "linebreak-style": [
    "error",
    "unix"
  ],
  "semi": [
    "error",
    "always"
  ],
  "eol-last": [
    "error",
    "always"
  ],
  "eqeqeq": [
    "error",
    "always"
  ],
  "react/jsx-uses-react": "off",
  "react/react-in-jsx-scope": "off",
};

module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "react"
  ],
  "settings": {
    "react": {
      "version": "detect",
    },
  },
  "rules": {
    ...rules,
  },
  "overrides": [
    {
      "files": ["src/**/*.ts", "src/**/*.tsx"],
      "env": {
        "browser": true,
        "es2021": true,
        "node": true
      },
      "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
      ],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "ecmaFeatures": {
          "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
      },
      "plugins": [
        "react",
        "@typescript-eslint"
      ],
      "settings": {
        "react": {
          "version": "detect",
        },
      },
      "rules": {
        ...rules,
        "no-unused-vars": "off",
        "react/prop-types": "off",
      },
    }
  ],
};
