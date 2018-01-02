# json-partials

## Example

`one.json`
```
{
    "value": 1
}
```

`two.json`
```
{
    "value": 2
}
```

`three.json`
```
{
    "one": <one>,
    "two": <two>,
    "list": [<two>, <one>]
}
```

`compiled.json`
```
{
    one: {
        value: 1
    },
    two: {
        value: 2
    },
    list: [{
        value: 2
    }, {
        value: 1
    }]
}
```

### Todo

- write better docs
- doc string the shit out of the code