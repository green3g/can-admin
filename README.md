<!--
@page crud Home
@group crud.guides Guides
-->

# Can Crud App

[![Join the chat at https://gitter.im/roemhildtg/can-crud-app](https://badges.gitter.im/roemhildtg/can-crud-app.svg)](https://gitter.im/roemhildtg/can-crud-app?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Components

This app utilizes canjs components from the following, both of which can be used individually:

 * can-ui - User interface bootstrap style components [![Build Status](https://travis-ci.org/roemhildtg/can-ui.svg?branch=master)](https://travis-ci.org/roemhildtg/can-ui)
 * can-crud - Data management and display tools [![Build Status](https://travis-ci.org/roemhildtg/can-crud.svg?branch=master)](https://travis-ci.org/roemhildtg/can-crud)

### Requirements
* NodeJS
* A web server (apache, nginx)

### Optional requirements
Some of the widgets require some sort of an REST server. Flask paired with
Flask-Restless has been used in developing this application because it is easy
to set up and flexible enough to expand.

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

## Open source projects used

* [CanJS](http://canjs.com/) - *Custom web components, 2-way binding mustache and handlebar templates*
* [StealJS](http://stealjs.com/) - *Dependency loader and builder/optimizer*
* [Bootstrap 3](http://getbootstrap.com/) - *Front end ui framework*
* [Font Awesome](https://fortawesome.github.io/Font-Awesome/) - *The iconic font and CSS toolkit*

## Contributing
* Additional tests and documentation
* Constructive criticism and code reviews
* Pull requests and widget enhancements/additions
