# Testing

Tests are implemented using `Jest` library. To run them use:

```
npm run test
```

It automatically checks for all files named like `<name>.test.js`. It also doesn't require us to import all needed functions as it automatically can reference them - mean `describe`, `test`, etc.

GitHub pipeline is also configured to run tests on each pull request or push to main branch. It will prevent potential bugs in production.

Look at `./Example.test.js` to see how it works in a small piece.
