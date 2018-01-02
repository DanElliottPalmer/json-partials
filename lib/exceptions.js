'use strict';

class PartialException extends Error {
    constructor(message, source, filename, lineNumber){
        super(message, filename, lineNumber);
        this.source = source;
    }
}

module.exports = {
    PartialException
};
