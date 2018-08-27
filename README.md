# isoeval

Safely evaluate JavaScript code in any environment.

Install:
`npm i -s isoeval`

Examples:

```javascript
import isoeval from 'isoeval';

var pow = isoeval(['x', 'y'], `
    return x ** y;
`);

console.log(pow(2, 8));
```
