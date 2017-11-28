<!--
@page can-admin Home
@group can-admin.guides Guides
-->

# Can Admin App

[![Join the chat at https://gitter.im/roemhildtg/can-admin](https://badges.gitter.im/roemhildtg/can-admin.svg)](https://gitter.im/roemhildtg/can-admin?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/roemhildtg/can-admin.svg?branch=master)](https://travis-ci.org/roemhildtg/can-admin)

A configureable javascript client to build administrative data displays for rest services. Utilizing can-connect and canjs, this app can easily provide a method to update, view, and create almost any type of data.

This app currently is under active development, and should therefore be considered BETA, however, it should be stable enough to use for testing at a minumum and potentially in production. Watch the issues on dependency packages for potentially breaking changes or future enhancements.

### Features

 - View, Edit, Create, and Delete data with the ability to restrict each
 - Sort and paginate data
 - Filter and search data
 - View relationships with other types of data. Data views can be related to other types of data through an id or key value
 - Create progressivly loaded bundles easily from modules so page load times are decreased and the user only loads the data they need

### Demo

Note: Demo will take a couple of minutes to boot up once visited. You may need to refresh the page a couple of times. Please be patient.

You can try out a demo of this app paired with a flask server here: http://cancrud-roemhildtg.rhcloud.com/

### Setup the project
```bash
git clone http://path-to-this-repository
npm install
```

The application should run in a web browser now using `index-dev.html`. To build it for production:
```bash
npm run build
```

Use `index.html` to use the production build


### Requirements
* NodeJS
* A web server (apache, nginx)

### Optional requirements
Some of the widgets require some sort of an REST server. Flask paired with
Flask-Restless has been used in developing this application because it is easy
to set up and flexible enough to expand.

## Open source projects used

* [CanJS](http://canjs.com/) - *Custom web components, 2-way binding mustache and handlebar templates*
* [StealJS](http://stealjs.com/) - *Dependency loader and builder/optimizer*
* [Spectre.css](https://github.com/picturepan2/spectre) - *Javascript free css component library*
* [Font Awesome](https://fortawesome.github.io/Font-Awesome/) - *The iconic font and CSS toolkit*

## Contributing
* Additional tests and documentation
* Constructive criticism and code reviews
* Pull requests and widget enhancements/additions
