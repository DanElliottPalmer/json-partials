'use strict';

const fs = require('fs');
const path = require('path');

const JSONPartial = require('..').JSONPartial;

main();

function readFile(filename){
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if(err) return reject(err);
            resolve(data.toString());
        });
    });
}

async function main(){
    const files = await Promise.all([
        readFile(path.join(__dirname, 'one.json')),
        readFile(path.join(__dirname, 'two.json')),
        readFile(path.join(__dirname, 'three.json')),
        readFile(path.join(__dirname, 'namespaced/point.json')),
    ]);

    JSONPartial.addPartials({
        'one': files[0],
        'two': files[1],
        'three': files[2],
        'namespaced.point': files[3],
    });

    console.log(JSONPartial.parse('<three>'));
}
