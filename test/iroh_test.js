//this file was written with the help of Claude sonnet 4.5
const Iroh = require('iroh');

// Define your function as a string
//original function was mine
const code = `
function factorial(n) {
    if (n === 0 || n === 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

// Call the function
console.log('Result:', factorial(3));
`;

//Clause Sonnet 4.5 helped add stage and listeners
// Create an iroh stage and add listeners
const stage = new Iroh.Stage(code);

// Add event listeners to trace execution
stage.addListener(Iroh.CALL).on('before', (e) => {
	console.log('  '.repeat(e.indent) + `call ${e.name} ( [${e.arguments}] )`);
});

stage.addListener(Iroh.CALL).on('after', (e) => {
	console.log('  '.repeat(e.indent) + `call ${e.name} end -> [${e.return}]`);
});

stage.addListener(Iroh.IF).on('enter', (e) => {
	console.log('  '.repeat(e.indent) + 'if');
});

stage.addListener(Iroh.IF).on('leave', (e) => {
	console.log('  '.repeat(e.indent) + 'if end');
});

// Execute the instrumented code
eval(stage.script);
