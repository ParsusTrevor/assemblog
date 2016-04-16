#!/usr/bin/env node

var lib     = require('./lib/assemblog');
var request = require('request-promise');
var EOL     = require('os').EOL;
var fs      = require('fs');
var _       = require('lodash');

var API_KEY    = process.env.API_KEY;
var API_SECRET = process.env.API_SECRET;

var _debug    = console.log;
var milestoneTitle = process.argv[2];
var changelog = process.argv[3];

var urlbase = 'https://api.assembla.com/v1/spaces/acdhh/';
var options = {
  url: urlbase + 'milestones',
  headers: {
    'X-Api-Key': API_KEY,
    'X-Api-Secret': API_SECRET
  }
};

var milestone = null;

request(options)
  .then(function(body) {
    milestone = lib.getMilestone(body, milestoneTitle);
    return milestone;
  })
  .then(function (milestoneTitle) {
    return lib.requestTickets(milestoneTitle, options, urlbase);
  })
  .then(function (body) {
    return lib.getChangeLog(body, milestone);
  })
  .then(function (lines) {
    return lib.writeChangeLog(changelog, lines);
  })
  .catch(function (err) {
    _debug(err);
  });
