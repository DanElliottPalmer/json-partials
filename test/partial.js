'use strict';

const assert = require('chai').assert;

const { PartialMap, Partial } = require('..');
const { PartialException } = require('../lib/exceptions');

beforeEach(() => {
    PartialMap.strictMode = true;
    PartialMap.clear();
});

describe('Partial', () => {

    describe('dispose', () => {
        it('clear all values', () => {
            const partial = new Partial('');
            partial.dispose();
            assert(partial._source === null);
            assert(partial._jsonString === null);
            assert(partial._json === null);
            assert(partial._replacements === null);
            assert(!partial._parsed);
            assert(!partial._rendered);
            assert(partial._disposed);
        });
    });

    describe('json', () => {
        it('should parse and render plain json', () => {
            const partial = new Partial('{"a": true, "b": [1, 2, 3]}');
            assert.deepEqual(partial.json, {
                a: true,
                b: [1, 2, 3]
            });
        });

        it('should parse and render partials', () => {
            const a = new Partial('{"value": "this is a"}');
            const b = new Partial('{"value": "this is b"}');
            const c = new Partial('{"value": "this is c"}');
            PartialMap.set('a', a);
            PartialMap.set('b', b);
            PartialMap.set('c', c);

            const partial = new Partial('{"a": <a>, "b": [<b>, <c>]}');
            assert.deepEqual(partial.json, {
                a: {
                    value: "this is a"
                },
                b: [{
                    value: "this is b"
                },{
                    value: "this is c"
                }]
            });
        });

        it('should rerender if a partial dependency changes', () => {
            const a = new Partial('{"value": "this is a"}');
            const b = new Partial('{"value": "this is b"}');
            const c = new Partial('{"value": "this is c"}');

            PartialMap.set('a', a);
            PartialMap.set('b', b);
            PartialMap.set('c', c);

            const testPartial = new Partial('{"a": <a>, "b": [<b>, <c>]}');
            PartialMap.set('test', testPartial);
            assert.deepEqual(testPartial.json, {
                a: {
                    value: "this is a"
                },
                b: [{
                    value: "this is b"
                },{
                    value: "this is c"
                }]
            });

            b.source = '{"changes": true}';

            assert.deepEqual(testPartial.json, {
                a: {
                    value: "this is a"
                },
                b: [{
                    changes: true
                },{
                    value: "this is c"
                }]
            });
        });

        it('should have a render state', () => {
            const a = new Partial('{"value": "this is a"}');
            assert(!a.rendered);
            const json = a.json;
            assert(a.rendered);
        });
    });

    describe('source', () => {
        it('should return the original source', () => {
            const originalSource = '{"a": true, "b": [1, 2, 3]}';
            const partial = new Partial(originalSource);
            assert(partial.source === originalSource);
        });

        it('should set the source and invalidate', () => {
            const source1 = '{"a": true, "b": [1, 2, 3]}';
            const source2 = '{"b": true, "a": [1, 2, 3]}';
            const partial = new Partial(source1);
            assert(!partial.parsed);
            const json1 = partial.json;
            assert(partial.parsed);
            partial.source = source2;
            assert(!partial.parsed);
            const json2 = partial.json;
            assert(partial.parsed);
            assert.notDeepEqual(json1, json2);
        });

        it('should only invalidate if the source is different', () => {
            const source = '{"a": true, "b": [1, 2, 3]}';
            const partial = new Partial(source);
            let json = partial.json;
            assert(partial.parsed);
            partial.source = source;
            assert(partial.parsed);
        });

        it('should have a parse state', () => {
            const a = new Partial('{"value": "this is a"}');
            assert(!a.parsed);
            const json = a.json;
            assert(a.parsed);
        });
    });

    describe('toString', () => {
        it('should return string representation of the compiled json', () => {
            const a = new Partial('{"value": "this is a"}');
            const b = new Partial('{"value": "this is b"}');
            const c = new Partial('{"value": "this is c"}');
            PartialMap.set('a', a);
            PartialMap.set('b', b);
            PartialMap.set('c', c);

            const partial = new Partial('{"a": <a>, "b": [<b>, <c>]}');
            const output = '{"a": {"value": "this is a"}, "b": [{"value": "this is b"}, {"value": "this is c"}]}';
            assert(partial.toString(), );
        });
    });

});

