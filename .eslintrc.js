module.exports = {
    root: true,
    "globals": {
        "$": true,//zepto
        "_hmt": true,//total
        "define": true,//requirejs
        "require": true,//requirejs
        "EZGesture": true,
        "ZEPETO": true,
        "loading": true,
        "LazyPicker": true
    },
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    rules: {
        'no-console': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
