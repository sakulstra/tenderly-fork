# Security Policy

Major bug-risk in the use of process.exit() in JS-0263 on line 61 and 72 check here: https://github.com/philipjonsen/tenderly-fork/blob/master/create.js#L72-L72

## Supported Versions

 Description

The process.exit() method in Node.js is used to immediately stop the Node.js process and exit. This is a dangerous operation because it can occur in any method at any point in time, potentially stopping a Node.js application completely when an error occurs. For example:

if (somethingBadHappened) {
    console.error("Something bad happened!");
    process.exit(1);
}

This code could appear in any module and will stop the entire application when somethingBadHappened is truthy. This doesn't give the application any chance to respond to the error. It's usually better to throw an error and allow the application to handle it appropriately:

if (somethingBadHappened) {
    throw new Error("Something bad happened!");
}

By throwing an error in this way, other parts of the application have an opportunity to handle the error rather than stopping the application altogether. If the error bubbles all the way up to the process without being handled, then the process will exit and a non-zero exit code will returned, so the end result is the same.

If you are using process.exit() only for specifying the exit code, you can set process.exitCode (introduced in Node.js 0.11.8) instead.
Bad Practice

process.exit(1);
process.exit(0);

Recommended

Process.exit();
var exit = process.exit;

