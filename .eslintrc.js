module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "node/no-extraneous-require": ["error", {
          "allowModules": ["express", "mongoose"]
        }],
        "node/no-missing-require": ["error", {
          "allowModules": ["express", "mongoose"]
        }],
        "node/no-unpublished-require": ["error", {
          "allowModules": ["express", "mongoose"]
        }],
        "no-console": "off",
        "semi": ["error", "always"],
        "quotes": ["error", "single"],
        "comma-dangle": ["error", "never"],
        "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
      }
}
