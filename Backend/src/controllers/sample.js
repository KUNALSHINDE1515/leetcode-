const sampObj ={
    
}

const fs = require('fs');


function addTwoNumbers(a,b){
    // write Your code
}


// Reading input from stdin(using fs to read all input)

const input = fs.readFileSync(0,"utf-8").trim()

const [a,b] = input.split("").map(Number)

console.log(addTwoNumbers(a,b));
