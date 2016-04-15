#!/usr/bin/env node

var request = require('request-promise');
var EOL = require('os').EOL;
var fs      = require('fs');
var _       = require('lodash');

var API_KEY = process.env.API_KEY;
var API_SECRET = process.env.API_SECRET;

var _debug = console.log;
var milestone = process.argv[2];
var changelog = process.argv[3];

var urlbase = 'https://api.assembla.com/v1/spaces/acdhh/';
var options = {
  url: urlbase + 'milestones',
  headers: {
    'X-Api-Key': API_KEY,
    'X-Api-Secret': API_SECRET
  }
};


function findMatchingMilestoneId(body) {
  var milestoneId;

  var data = JSON.parse(body);
  milestoneId = _.filter(data, function (item) {
    return item.title === milestone;
  })[0].id;

  return milestoneId;
};

function requestTickets(milestoneId) {
    options.url = urlbase + 'tickets' + '/' + 'milestone' + '/' + milestoneId + '?per_page=100&ticket_status=all';
    return request(options);
}

function writeChangeLog(body) {
  var lines = [];
  var data = JSON.parse(body);
  var milestoneTickets = data;

  var header = '## ' + milestone;
    lines.push(header);

    lines.push('### Added');
    _.map(data, function (ticket) {
      var entry = '- ' + ticket.summary + ' ([#' + ticket.number + '](' + 'http://www.assembla.com/spaces/acdhh/tickets/' + ticket.number + '))';

      lines.push(entry);
    });

    lines.push('### Changed');
    lines.push('### Fixed');

    fs.readFile(changelog, function(err, data) {
      if (err) throw err;

      var filelines = _.split(data, EOL);
      var args = [4, 0].concat(lines);
      Array.prototype.splice.apply(filelines, args);
      var buffer = new Buffer(_.join(filelines, EOL), 'utf8');
      fs.open(changelog, 'w+', function(err, fd) {
        if(err) throw err;
        fs.write(fd, buffer, 0, buffer.length, 0);
      });
    });
};

request(options)
    .then(findMatchingMilestoneId)
    .then(requestTickets)
    .then(writeChangeLog)
    .catch(function (err) {
        _debug(err);
    });
