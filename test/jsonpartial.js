'use strict';

const assert = require('chai').assert;

const { JSONPartial, PartialMap, Partial } = require('..');
const { PartialException } = require('../lib/exceptions');

beforeEach(() => {
    JSONPartial.strictMode = true;
    PartialMap.clear();
});

describe('JSONPartial', () => {

    describe('adding partials', () => {
        it('should load a json', () => {
            JSONPartial.addPartial('a', '{"value": true}');
            assert(JSONPartial.has('a'));
        });

        it('should load a partial', () => {
            JSONPartial.addPartial('b', '{"value": <b>}');
            assert(JSONPartial.has('b'));
        });

        it('should load a bunch of partials', () => {
            JSONPartial.addPartials({
                'a': '{"value": true}',
                'b': '{"value":<a>}'
            });
            assert(JSONPartial.has('a'));
            assert(JSONPartial.has('b'));
        });

        it('should dispose old partials when overwriting', () => {
            JSONPartial.addPartials({
                'a': '{"value": true}',
                'b': '{"value":<a>}'
            });
            const oldPartial = JSONPartial.get('b');
            assert(!oldPartial.disposed);
            JSONPartial.addPartials({
                'b': '{"value":10}'
            });
            assert(oldPartial.disposed);
        });

        it('should add premade partials', () => {
            const premadePartial = new Partial('{"value":<a>}');
            JSONPartial.addPartial('premade', premadePartial);
            assert(JSONPartial.has('premade'));
        });
    });

    describe('map interaction',() => {
        it('should return the partial map for partisl', () => {
            assert(JSONPartial.partials === PartialMap);
        })

        it('should clear a partial', () => {
            JSONPartial.addPartials({
                'a': '{"value": true}'
            });
            assert(JSONPartial.has('a'));
            JSONPartial.clear('a');
            assert(!JSONPartial.has('a'));
        });

        it('should clear all partials', () => {
            JSONPartial.addPartials({
                'a': '{"value": true}',
                'b': '{"value":<a>}'
            });
            assert(JSONPartial.has('a'));
            assert(JSONPartial.has('b'));
            JSONPartial.clear();
            assert(!JSONPartial.has('a'));
            assert(!JSONPartial.has('b'));
        });

        it('should get a value from the map', () => {
            JSONPartial.addPartial('a', '{"value": true}');
            const partial = JSONPartial.get('a');
            assert(partial !== undefined);
        });

        it('should set a value in the map', () => {
            JSONPartial.strictMode = false;
            assert(JSONPartial.get('test') === undefined);
            JSONPartial.strictMode = true;
            const partial = new Partial('{"value": <a>}');
            JSONPartial.set('test', partial);
            assert(JSONPartial.get('test') === partial);
        });

        it('should return false if partial not in map', () => {
            assert(!JSONPartial.has('test'));
        });

        it('should return true if partial in map', () => {
            JSONPartial.addPartial('test', '{"value": <b>}');
            assert(JSONPartial.has('test'));
        });

        it('should read PartialMap strictMode', () => {
            assert(JSONPartial.strictMode === PartialMap.strictMode);
        });

        it('should set PartialMap strictMode', () => {
            JSONPartial.strictMode = false;
            assert(JSONPartial.strictMode === PartialMap.strictMode);
        });

    });

    describe('parsing', () => {
        it('should parse some json with no partials', () => {
            const j = JSONPartial.parse('{"value": true}');
            assert.deepEqual(j, {value: true});
        });

        it('should parse some json with partials', () => {
            JSONPartial.addPartials({
                'a': '{"a": true}',
                'b': '{"b":<a>}'
            });
            const j = JSONPartial.parse('{"c": <b>, "d": <a>}');
            assert.deepEqual(j, {c: {b: {a: true}}, "d": {"a": true}});
        });

        it('should throw an error parsing bad json', () => {
            assert.throws(() => {
                JSONPartial.parse('{"a": some malformed json}');
            }, SyntaxError);
        });

        it('should throw an error parsing a bad partial', () => {
            JSONPartial.addPartials({
                'a': '{"a": true}',
                'b': '{"b": <a>, bad partial}'
            });
            assert.throws(() => {
                JSONPartial.parse('{"test": <b>}');
            }, PartialException);
        });

        it('should throw an error for unknown partials in strict mode', () => {
            assert.throws(() => {
                JSONPartial.parse('{"test": <a>}');
            }, PartialException);
        });

        it('should use null when it cant find a partial in non-strict mode', () => {
            JSONPartial.strictMode = false;
            const j = JSONPartial.parse('{"a": <b>}');
            assert.deepEqual(j, {a: null});
        });

        it('should pass the partial to the reviver', () => {
            JSONPartial.addPartials({
                'a': '{"a": true}',
                'b': '{"b":<a>}'
            });
            const json = JSONPartial.parse('{"test": <a>, "test2": <b>, "list": [ <a>,    <a>]}', (key, value) => {
                if(key === "test"){
                    value.reviver = true;
                } else if(key === "test2"){
                    return;
                }
                return value;
            });
            assert.deepEqual(json, {
                "test": {
                    "a": true,
                    "reviver": true
                },
                "list": [{
                    "a": true
                },{
                    "a": true
                }]
            });
        });
    });

    describe('stringify', () => {
        it('should stringify plain json', () => {
            const output = '{"a": true, "b": 10}';
            assert(JSONPartial.stringify({a: true, b: 10}), output);
        });

        it('should stringify a partial', () => {
            JSONPartial.addPartials({
                'a': '{"value": true}',
                'b': '{"value":<a>}'
            });
            const partial = JSONPartial.get('b');
            const output = '{"value":{"value":true}}';
            assert(JSONPartial.stringify(partial) === output);
        });
    });

});
