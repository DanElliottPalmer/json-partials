'use strict';

const assert = require('chai').assert;

const { PartialException} = require('../lib/exceptions');

describe('PartialException', () => {
    it('should contain exception source', () => {
        const errSource = '{butts}';
        const err = new PartialException('test error message', errSource);
        assert(err.source === errSource)
    });
});
