'use strict';

const build = require('@microsoft/sp-build-web');

const dotenv = require('dotenv');
dotenv.config();

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);

build.initialize(require('gulp'));
