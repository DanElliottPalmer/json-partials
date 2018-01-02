'use strict';

const { RE_PARTIAL } = require('./constants');
const { PartialException } = require('./exceptions');
const PartialMap = require('./PartialMap');

class Partial {
    constructor(source){
        this._source = source;
        this._jsonString = null;
        this._json = null;
        this._disposed = false;

        // Have we built the json?
        this._parsed = false;
        // Have we rendered previously?
        this._rendered = false;
        // Where are the replacements in the source?
        this._replacements = null;
        this._partialNames = null;
    }

    get parsed(){
        return this._parsed;
    }

    get rendered(){
        return this._rendered;
    }

    dispose(){
        this._source = null;
        this._jsonString = null;
        this._json = null;
        this._replacements = null;
        this._disposed = true;
        this._parsed = false;
        this._rendered = false;
    }

    get disposed(){
        return this._disposed;
    }

    _parse(){
        this._replacements = [];
        this._partialNames = new Set();
        let found = null;
        while((found = RE_PARTIAL.exec(this._source)) !== null){
            this._replacements.push({
                startIndex: found.index + found[0].indexOf(found[1]),
                lastIndex: RE_PARTIAL.lastIndex,
                partialName: found[2]
            });
            this._partialNames.add(found[2]);
        }
        RE_PARTIAL.lastIndex = 0;
        found = null;
        this._parsed = true;
    }

    _render(){
        let jsonStr = this._source;
        // Work backwards that way the index wont jump around
        for (let i = this._replacements.length - 1; i >= 0; i--) {
            const replacement = this._replacements[i];
            // Get partial json
            const partial = PartialMap.get(replacement.partialName);
            let partialJSON;
            if(!PartialMap.strictMode && partial === undefined){
                partialJSON = 'null';
            } else {
                partialJSON = partial.toString();
            }
            jsonStr = jsonStr.substring(0, replacement.startIndex)
                + partialJSON + jsonStr.substring(replacement.lastIndex);
        }
        this._jsonString = jsonStr;
        try {
            this._json = JSON.parse(jsonStr);
        } catch (err){
            throw new PartialException(
                `Error parsing partial: ${err.message}`,
                this._jsonString,
                err.fileName,
                err.lineNumber
            );
        }
        this._rendered = true;
    }

    _buildJSON(){
        if(!this._parsed) this._parse();
        if(!this._rendered) this._render();
    }

    get json(){
        if(this._rendered) return this._json;
        this._buildJSON();
        return this._json;
    }

    get source(){
        return this._source;
    }
    set source(source){
        if(source === this._source) return;

        invalidateDependencies(this);
        this._source = source;
        this._parsed = false;
        this._rendered = false;
    }

    toString(){
        if(this._rendered) return this._jsonString;
        this._buildJSON();
        return this._jsonString;
    }
}

function invalidateDependencies(partial){
    // Find names for the partials. Partials might sit under multiple names
    // in the map so we need to track that.
    const alterEgos = new Set();
    const parsedPartials = new Set();
    for(let [key, value] of PartialMap.entries()){
        if(value === partial){
            alterEgos.add(key);
        } else if(value.parsed) {
            parsedPartials.add(key);
        }
    }

    // Find partials that contain replacements
    for(let key of parsedPartials.values()){
        const dep = PartialMap.get(key);

        if(dep._partialNames.size === 0) continue;

        for(let partialName of alterEgos.values()){
            if(dep._partialNames.has(partialName)){
                dep._rendered = false;
                continue;
            }
        }
    }
}

module.exports = Partial;
