const fs = require('fs');

const {
    expect,
} = require('chai');

const persist = require('../index');

function readJson(f) {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
}

describe('default', () => {
    
    beforeEach(() => {
        try {
            fs.unlinkSync('data.json');
        } catch (e) {}
    });

    describe('write', () => {
        it('persists changes top level', () => {
            const o = persist();

            o.a = 1;

            expect(readJson('data.json')).to.deep.equal({a:1});
        });

        it('persists changes second level', () => {
            const o = persist();

            o.a = {};
            o.a.b = 9;

            expect(readJson('data.json')).to.deep.equal({a:{b:9}});
        });

        it('persists changes second level array', () => {
            const o = persist();

            o.a = [91];
            o.a.push(92);

            expect(readJson('data.json')).to.deep.equal({a:[91, 92]});
        });

        it('persists changes detach', () => {
            const o = persist();

            o.a = [91];
            const x = o.a;
            x.push(93)

            expect(readJson('data.json')).to.deep.equal({a:[91, 93]});
        });

        it('persists object changes', () => {
            const o = persist();

            o.a = {b: 2};
            expect(readJson('data.json')).to.deep.equal({a: {b: 2}});

            o.a = {c: 6};
            //expect(JSON.stringify(o)).to.deep.equal({a:{c:6}});
            expect(readJson('data.json')).to.deep.equal({a: {c: 6}});
        });
    });

    describe('read', () => {
        it('read changes top level', () => {
            const o = persist();

            o.a = 9;

            fs.writeFileSync('data.json', '{"a":55}', 'utf8');

            expect(o.a).to.equal(55);
        });

        it('read changes second level', () => {
            const o = persist();

            o.a = {b:8};

            fs.writeFileSync('data.json', '{"a":{"b": 77}}', 'utf8');

            expect(o.a.b).to.equal(77);
        });

        it('read changes detatched', () => {
            const o = persist();

            o.a = {b:8};
            const x = o.a;

            fs.writeFileSync('data.json', '{"a":{"b": 54}}', 'utf8');

            expect(x.b).to.equal(54);
        });
    });

});
