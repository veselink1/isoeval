# isoeval

Safely evaluate JavaScript code in any environment.

### Installation
`npm i -s isoeval`

### How it works
`isoeval` wraps the provided source code in a different execution context, by a total of 3 wrapper functions which hide all the global variables from it, and then export the user-supplied arguments and context. The way it does this is by keeping a list of all JavaScript global variables, as described by the EcmaScript specification, and dynamically creates a function with an argument signature with the same names as all the rest global names (but whose value in the function will be `undefined`). It then wraps the code in a second function, supplying all the real arguments provided to the function, and thirdly, wraps the code with a `with(expr) {...}` statement, providing the context object (if any). A new lambda with the code provided is then immediately returned, so the context is cached for subsequent calls and doesn't need to be created again.  

### Examples

```javascript
import isoeval from 'isoeval';

var pow = isoeval(['x', 'y'], `
    return x ** y;
`);

console.log(pow(2, 8));
```
