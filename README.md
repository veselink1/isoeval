# isoeval
Safely evaluate JavaScript code in any environment.

Examples

```javascript
import isoeval from 'isoeval';

var pow = isoeval(['x', 'y'], `
    return x ** y;
`);

console.log(pow(2, 8));
```