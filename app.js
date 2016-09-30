#!/usr/bin/env node

var lib     = require('./lib/assemblog');


var request = require('request-promise');
var EOL     = require('os').EOL;
var fs      = require('fs');
var _       = require('lodash');

var API_KEY    = process.env.API_KEY;
var API_SECRET = process.env.API_SECRET;

var _debug = console.log;

var argv = require('yargs')
        .require('milestone', 'Must provide a milestone')
        .argv;

var milestoneName = argv.milestone;
var changelog = argv.changelog;

var urlbase = 'https://api.assembla.com/v1/spaces/acdhh/';
var options = {
  url: urlbase + 'milestones',
  headers: {
    'X-Api-Key': API_KEY,
    'X-Api-Secret': API_SECRET
  }
};

request(options)
  .then(function(body) {
    return lib.getMilestone(body, milestoneName);
  })
  .then(function (milestone) {
    return lib.requestTickets(milestone, options, urlbase, 1)
      .then(function(body) {
        return lib.getChangeLog(body, milestone)
      });
  })
  .then(function (lines) {
    if(changelog)
      return lib.writeChangeLog(changelog, lines);

    lines.map((line) => {
      process.stdout.write(`${line}\n`);
      return line;
    });

    return lines;
  })
  .catch(function (err) {
    _debug(err);
  });
