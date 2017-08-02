0.12.5 / 2017-07-20
===================

  * 0.12.5
  * canjs 3.9

0.12.4 / 2017-07-20
===================

  * 0.12.4
  * restructure directory and update packages

0.12.3 / 2017-06-26
===================

  * 0.12.3
  * FIX: algebra with equals/not_equals coerce values

0.12.2 / 2017-06-13
===================

  * 0.12.2
  * FIX: Switch order of behaviors to avoid can-connect error

0.12.1 / 2017-05-26
===================

  * 0.12.1
  * bug fixes

0.12.0 / 2017-05-26
===================

  * changelog
  * 0.12.0
  * fixup idProp undefined
  * ignore db
  * patch up tests
  * convert can-admin/behaviors/flask-restless to a simplified can-connect behavior

0.11.1 / 2017-05-25
===================

  * 0.11.1
  * FIX: algebra
    - if there's no value in the filter, skip it
    - if string operator isn't passed a string, return false
    - convert strings to lower case on like operators

0.11.0 / 2017-05-16
===================

  * Merge remote-tracking branch 'origin/master'
  * 0.11.0
  * FIX: renames `fieldName` to `field`

0.10.1 / 2017-05-03
===================

  * 0.10.1
  * overall code cleanup
    - don't seal metadata
  * Merge pull request [#48](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/48) from roemhildtg/greenkeeper/initial
    Greenkeeper/initial
  * docs(readme): add Greenkeeper badge
  * chore(package): update dependencies
  * BUILD: don't export css

0.10.0 / 2017-04-14
===================

  * 0.10.0
  * FIX: add idProp to attributes serialized from the server
    - flask-restless doesn't include the idProp in properties

0.9.0 / 2017-03-16
==================

  * 0.9.0
  * lint
  * cleanup
  * add some basic algebra
  * changelog

0.8.0 / 2017-03-07
==================

  * 0.8.0
  * lint
  * remove extra files
  * update build/deps
  * 0.7.1

0.7.0 / 2017-03-07
==================

  * 0.7.0
  * minor test fixes
  * allow filters with 0 or false to be serialized
  * cleanup
  * Merge branch 'canjs-3.0'
  * lint
  * Merge pull request [#45](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/45) from roemhildtg/greenkeeper-can-connect-1.0.19
    can-connect@1.0.19 untested ⚠️
  * chore(package): update can-connect to version 1.0.19
    https://greenkeeper.io/
  * Merge pull request [#44](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/44) from roemhildtg/greenkeeper-can-util-3.2.0
    can-util@3.2.0 untested ⚠️
  * chore(package): update can-util to version 3.2.0
    https://greenkeeper.io/
  * Merge pull request [#43](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/43) from roemhildtg/greenkeeper-can-define-1.0.8
    can-define@1.0.8 untested ⚠️
  * chore(package): update can-define to version 1.0.8
    https://greenkeeper.io/
  * Merge pull request [#40](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/40) from roemhildtg/greenkeeper-eslint-3.12.1
    eslint@3.12.1 untested ⚠️
  * chore(package): update eslint to version 3.12.1
    https://greenkeeper.io/
  * Merge pull request [#39](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/39) from roemhildtg/greenkeeper-eslint-3.12.0
    eslint@3.12.0 untested ⚠️
  * chore(package): update eslint to version 3.12.0
    https://greenkeeper.io/
  * Merge pull request [#38](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/38) from roemhildtg/greenkeeper-testee-0.3.0
    testee@0.3.0 untested ⚠️
  * chore(package): update testee to version 0.3.0
    https://greenkeeper.io/
  * Merge pull request [#37](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/37) from roemhildtg/greenkeeper-can-connect-1.0.15
    can-connect@1.0.15 untested ⚠️
  * chore(package): update can-connect to version 1.0.15
    https://greenkeeper.io/
  * remove extra imports and console
  * Merge pull request [#36](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/36) from roemhildtg/canjs-3.0
    Canjs 3.0
  * 0.6.1
  * Merge remote-tracking branch 'origin/master' into canjs-3.0
    # Conflicts:
    #    package.json

0.6.0 / 2016-12-07
==================

  * 0.6.0
  * don't serialize filters if they don't have a value

0.5.1 / 2016-12-05
==================

  * 0.5.1
  * adds jquery ajax dep
  * working on tests...
  * remove console.logs

0.5.0 / 2016-12-05
==================

  * 0.5.0
  * 0.4.0
  * updates dependency
  * Merge pull request [#33](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/33) from roemhildtg/greenkeeper-can-connect-1.0.14
    can-connect@1.0.14 untested ⚠️
  * chore(package): update can-connect to version 1.0.14
    https://greenkeeper.io/
  * Merge pull request [#29](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/29) from roemhildtg/greenkeeper-can-connect-1.0.12
    Update can-connect to version 1.0.12 🚀
  * chore(package): update can-connect to version 1.0.12
    https://greenkeeper.io/
  * switch to basemap to avoid "combine-requests"
    - fix typo with params
  * Switch to using jquery ajax
  * WIP on master: 66973ca add npmignore
  * index on master: 66973ca add npmignore
  * update to can3.0 initial commit
  * Merge pull request [#10](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/10) from roemhildtg/greenkeeper-steal-qunit-0.1.4
    steal-qunit@0.1.4 untested ⚠️
  * chore(package): update steal-qunit to version 0.1.4
    https://greenkeeper.io/
  * Merge pull request [#7](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/7) from roemhildtg/greenkeeper-can-2.3.27
    can@2.3.27 untested ⚠️
  * chore(package): update can to version 2.3.27
    https://greenkeeper.io/

0.3.1 / 2016-09-15
==================

  * add npmignore
  * 0.3.1

0.4.0 / 2016-07-28
==================

  * Update package.json
  * Update index.js

0.3.0 / 2016-07-09
==================

  * 0.3.0
  * Add flask to travis build
  * Tests
  * ignore virtualenv
  * Merge pull request [#1](https://github.com/roemhildtg/can-admin/behaviors/flask-restless/issues/1) from roemhildtg/fix-filter-serialization
    Fixes minor bug in the way that filters were being serialized
    Rename `metadata.totalItems` to metadata.total`
  * Fixes minor typo where operator serializers were not being called
  * rename metadata property to total
  * Fixes minor bug in the way that filters were being serialized

0.2.0 / 2016-07-06
==================

  * add build instructions
