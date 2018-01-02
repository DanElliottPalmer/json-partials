'use strict';

const { RE_PARTIAL } = require('./constants');
const PartialMap = require('./PartialMap');
const Partial = require('./Partial');

class JSONPartial {

    constructor(){}

    get strictMode(){
        return PartialMap.strictMode;
    }
    set strictMode(mode){
        PartialMap.strictMode = mode;
    }

    get partials(){
        return PartialMap;
    }

    clear(partialKey=null){
        if(partialKey !== null){
            this.partials.delete(partialKey);
        } else {
            this.partials.clear();
        }
    }

    has(partialKey){
        return this.partials.has(partialKey);
    }

    get(partialKey){
        return this.partials.get(partialKey);
    }

    set(partialKey, partial){
        this.partials.set(partialKey, partial);
    }

    addPartial(partialName, partialSource){
        if(this.has(partialName)){
            const oldPartial = this.get(partialName);
            oldPartial.dispose();
        }
        let newPartial = null;
        if(partialSource instanceof Partial){
            newPartial = partialSource;
        } else {
            newPartial = new Partial(partialSource);
        }
        this.set(partialName, newPartial);
    }

    addPartials(partialObject){
        const entries = Object.entries(partialObject);
        for(const [partialName, partialSource] of entries){
            this.addPartial(partialName, partialSource);
        }
    }

    parse(jsonSource, reviver=null){
        if(RE_PARTIAL.test(jsonSource)){
            RE_PARTIAL.lastIndex = 0;
            const partial = new Partial(jsonSource);
            let json = partial.json;
            if(reviver !== null){
                const startValue = {};
                startValue[""] = json;
                json = walkObject(startValue, "", reviver);
            }
            return json;
        } else {
            RE_PARTIAL.lastIndex = 0;
            return JSON.parse(jsonSource, reviver);
        }
    }

    stringify(value, ...args){
        if(value instanceof Partial){
            return JSON.stringify(value.json, ...args);
        } else {
            return JSON.stringify(value, ...args);
        }
    }

}

function updateObject(obj, prop, reviver){
    const value = walkObject(obj, prop, reviver);
    // If value is undefined then we need to delete the value from the object
    if(value === undefined){
        delete obj[prop];
    } else {
        obj[prop] = value;
    }
}

function walkObject(obj, prop, reviver){
    const value = obj[prop];
    if(typeof value === 'object' && value){
        if(Array.isArray(value)){
            value.forEach((_, index) => {
                updateObject(value, index, reviver);
            });
        } else {
            Object.keys(value).forEach((oKey) => {
                updateObject(value, oKey, reviver);
            });
        }
    }
    return reviver.call(obj, prop, value);
}

module.exports = new JSONPartial();
