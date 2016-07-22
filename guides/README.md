<!--
@page start Getting Started
@parent crud.guides
-->

# Views

Each page in this app is considered a `view` object that contains the configuration
properties necessary to display and update data. Each view is required to have a
data model layer, which is referenced by the `connection` property. The connection
is simply a [can-connect](https://connect.canjs.com/) object, which essentially
allows any data source to be used.

Views control how fields are displayed, and how the data is edited, for example, what type of
field to display to the user, and whether or not the user has permission to delete/edit/add data.

## Loading Views

By default, views are loaded on demand, so the loading time is decreased. The first step is
to tell the crud app where the views are. The default config file (config/default/default) has
examples on how this is done:

```javascript
export let config = {
  views: [{
    title: 'Tasks',
    path: 'config/default/Task',
    iconClass: 'fa fa-tasks'
  }]
};
```

This file is initially loaded by first checking for a query string on the url. For example if the url is

```
www.mysite.com/index.html?config=config/other/myConfig
```

Then the loader will try to find the file `config/other/myConfig.js`. If no query
string parameter is given, it will load `config/default/default`. With systemjs/StealJS,
this long url can actually be shortened to `config/default/` (note the trailing slash).

# Data Layers

Can connect provides the data layer that lets this app's components talk to a web server.
Configuring a new connect object can be tricky but can also be incredibly powerful. Many
rest servers will work quite well, while others may need more work to set up.

## Can-Restless

One example of a configured can-connect module is (can-restless)[https://www.npmjs.com/package/can-restless].

Can-restless abstracts the JSON api provided by Flask-Restless or any other
JSON API compatible server to work with the can-connect package.

# Tips

## Start simple

Start with the most basic view. Most properties are completely optional to enable
more functionality.

## Read the code

The code is heavily documented. Start with `can-crud/crud-manager/ViewMap` to
look over the view properties in detail. Also look over `can-crud/util/Field` to
see how fields can be configured.

## Ask questions

There's a gitter chat room, feel free to stop in sometime!
