const fs = require('fs');

module.exports = function(opts) {
    opts = {
        stringify: JSON.stringify,
        parse: JSON.parse,
        enc: 'utf8',
        filename: 'data.json',
        default: {},
        ...opts,
    };

    let data = opts.default;

    try {
        data = {
            ...data,
            ...opts.parse(fs.readFileSync(opts.filename, opts.enc)),
        };
    } catch (e) {
        if (e.code !== 'ENOENT') throw e;
        fs.writeFileSync(opts.filename, opts.stringify(data), opts.enc);
    }
    
    const saveOnAccess = path => ({
        get: (target, prop) => {
            data = opts.parse(fs.readFileSync(opts.filename, opts.enc));
            const pathToProp = `${path}.${prop}`;
            let val;
            try {
                val = eval('data.' + pathToProp);
            } catch (e) {
                val = target[prop]; // fallback for toJSON
            }
            if (typeof val === 'object' && val !== null) {
                val = new Proxy(val, saveOnAccess(pathToProp));
            }
            return val;
        },
        set: (target, prop, val) => {
            if (typeof val === 'object' && val !== null) {
                val = new Proxy(val, saveOnAccess(`${path}.${prop}`));
            }
            target[prop] = val;
            eval(`data.${path} = target`);
            fs.writeFileSync(opts.filename, opts.stringify(data), opts.enc);
            return true;
        }
    });

    return new Proxy(data, {
        get: (_, prop) => {
            data = opts.parse(fs.readFileSync(opts.filename, opts.enc));
            let val = data[prop];
            if (typeof val === 'object' && val !== null) {
                val = new Proxy(val, saveOnAccess(prop));
            }
            return val;
        },
        set: (_, prop, val) => {
            if (typeof val === 'object' && val !== null) {
                val = new Proxy(val, saveOnAccess(prop));
            }
            data[prop] = val;
            fs.writeFileSync(opts.filename, opts.stringify(data), opts.enc);
            return true;
        }
    });

};
