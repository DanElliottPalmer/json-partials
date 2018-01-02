'use strict';

const { PartialException } = require('./exceptions');

class PartialMap {
    constructor(){
        this.strictMode = true;
        this._map = new Map();
    }

    clear(){
        this._map.clear();
    }

    set(key, value){
        return this._map.set(key, value);
    }

    has(key){
        return this._map.has(key);
    }

    get(key){
        if(this.strictMode && !this.has(key)){
            throw new PartialException(`Unknown partial ${key}`);
        }
        return this._map.get(key);
    }

    delete(key){
        return this._map.delete(key);
    }

    entries(){
        return this._map.entries();
    }
}

module.exports = new PartialMap();