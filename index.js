const fs = require('fs');

module.exports = function(opts) {
    opts = {
        stringify: JSON.stringify,
        parse: JSON.parse,
        enc: 'utf8',
        filename: 'data.json',
        ...opts,
    };

    let data = {};

    try {
        data = opts.parse(fs.readFileSync(opts.filename, opts.enc));
    } catch (e) {
        if (e.code !== 'ENOENT') throw e;
        fs.writeFileSync(opts.filename, opts.stringify(data), opts.enc);
    }
    
    const saveOnAccess = {
        get: (target, prop) => {
            let val = target[prop];
            if (typeof val === 'object' && val !== null) {
                val = new Proxy(val, saveOnAccess);
            }
            return val;
        },
        set: (target, prop, val) => {
            target[prop] = val;
            fs.writeFileSync(opts.filename, opts.stringify(data), opts.enc);
            return true;
        }
    };

    return new Proxy(data, {
        get: (_, prop) => {
            data = opts.parse(fs.readFileSync(opts.filename, opts.enc));
            let val = data[prop];
            if (typeof val === 'object' && val !== null) {
                val = new Proxy(val, saveOnAccess);
            }
            return val;
        },
        set: (_, prop, val) => {
            if (typeof val === 'object' && val !== null) {
                val = new Proxy(val, saveOnAccess);
            }
            data[prop] = val;
            fs.writeFileSync(opts.filename, opts.stringify(data), opts.enc);
            return true;
        }
    });

};
