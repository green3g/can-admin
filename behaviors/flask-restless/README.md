<!--
@page can-admin/behaviors/flask-restless Home
@group can-admin/behaviors/flask-restless.types Type Definitions
-->

# can-admin/behaviors/flask-restless

[![Greenkeeper badge](https://badges.greenkeeper.io/roemhildtg/can-admin/behaviors/flask-restless.svg)](https://greenkeeper.io/)
A client data model for interacting with data from [`flask-restless`](https://github.com/jfinkels/flask-restless)
Note: can-admin/behaviors/flask-restless has been built to work with the JSON API specification that
flask-restless is currently developing. To utilize this package, the development version 1.0.0b should be used.


# Features
- Full crud api for retrieving, updating, and deleting data
- Retrieve lists of data with filtering, pagination, and sorting
- Pure data model, quickly build your own user interface, or use [can-crud](https://github.com/roemhildtg/can-admin-app)

# Quick Start

```
#install flask-restless from github:
virtualenv env
source env/bin/activate
pip install -e git://github.com/jfinkels/flask-restless.git#egg=flask-restless

#install can-admin/behaviors/flask-restless
npm install can-admin/behaviors/flask-restless --save
npm run export
```

## AMD

```javascript
require(['can-admin/behaviors/flask-restless/dist/amd/index'], function(Factory){
  var Task = Factory(/* ... */);
});
```

## Require JS

```javascript
var Factory = require('can-admin/behaviors/flask-restless/dist/cjs/index');
var Task = Factory(/* .... */);
```

## StealJS - ES6 Style Example

```javascript
import Factory from 'can-admin/behaviors/flask-restless/index';
import CanMap from 'can/map/';

let TaskMap = CanMap.extend({
  name: 'My Task',
  description: 'More details about the task'
  is_complete: false,
});

let Task = Factory({
  map: TaskMap,

  //this is the default id property
  //idProp: 'id',
  name: 'task',
  url: '/api/tasks'
});

//fetch the list with no parameters
let deferred = Task.getList({});

//fetch the list with sorting
deferred = Task.getList({
  sort: {
    type: 'asc',
    fieldName: 'description'
  }
});

//fetch the list with a filter
deferred = Task.getList({
  filters: [{
    name: 'description',
    operator: 'like',
    value: '%details%'
  }]
});

//fetch one item by id
deferred = Task.get({
  id: 1
});
```

# Running the tests
Set up flask restless:

```
cd test/demo
virtualenv env
source env/bin/activate
pip install -r pip_require.txt
python run.py
```

Once the development server is running, run the tests either in a browser at `index.html` or by running

```
npm run test
```

# Limitations
**Filtering**:

Currently the only filter syntax supported is the array type with `name`, `op`, and `val`. Each filter in the array will be "and". Or is not currently implemented. For example:

```
deferred = Task.getList({
  filters: [{
    name: 'description',
    operator: 'like',
    value: '%details%'
  }, {
    name: 'birth_date',
    operator: 'after',
    value: '10/5/2005'
  }]
});
```

Will query person where name contains "details" AND where birth_date is after October 5, 2005.

# Contributing
Contributions from anyone are welcome!
- Pull Requests
- Report Issues via the issue tracker on github
- Feedback and Code Reviews
