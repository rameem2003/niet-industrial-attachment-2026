console.log("Hello World");

// sync vs async js
// sync js is executed line by line
// async js is executed in parallel

// promise
// promise is a object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value.
// promise has three states: pending, fulfilled, and rejected.
// promise has three methods: then, catch, and finally.


console.log("1 sync");


setTimeout(() => {
    console.log("2 sync");
}, 3 * 1000)

setInterval(() => {
    console.log("setInterval triggered");
}, 3 * 1000)


console.log("3 sync");

Promise.resolve().then(() => {
    console.log("promise 1");
})


// sync task -> microtask (network request, Promise Response) -> macro task (setTimeout, setInterval)