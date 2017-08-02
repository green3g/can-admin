import connectionFactory from './CanRestless';
import q from 'steal-qunit';
import DefineMap from 'can-define/map/map';

let Person, jeff;

q.module('lib/CanRestless', {
    beforeEach () {
        Person = connectionFactory({
            name: 'person',
            url: `http://${window.location.host}:5000/api/person`,
            Map: DefineMap.extend('Person', {
                id: 'string',
                name: 'string',
                // eslint-disable-next-line camelcase
                birth_date: 'date'
            })
        });

        jeff = new Person.Map({
            name: 'Jeffry Doe',
            // eslint-disable-next-line camelcase
            birth_date: new Date()
        });
    },
    afterEach () {
        Person = null;
        jeff = null;
        localStorage.clear();
    }
});

q.test('getting list data', (assert) => {
    const done = assert.async();
    //read the data
    Person.getList({}).then((data) => {
        assert.ok(typeof data.length !== 'undefined', 'data should be an array type');
        done();
    });
});

q.test('saving new data', (assert) => {
    const done = assert.async();
    Person.save(jeff).then((data) => {
        assert.ok(data.id, 'data should be resolved and new data created should have an id');
        done();
    }).catch((error) => {
        throw new Error(error);
    });
});

q.test('destroying data', (assert) => {
    const done = assert.async();
    //delete the data
    Person.destroy(jeff).then((data) => {
        assert.ok(data, 'data should be resolved successfully');
        done();
    }).catch((data) => {
        assert.ok(data, 'if not found, data should still resolve successfully');
        done();
    });
});
