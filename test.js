var isoeval = require('./isoeval').default;

var pow = isoeval(['x', 'y'], `
    return x ** y;
`);

console.log(pow(2, 8));