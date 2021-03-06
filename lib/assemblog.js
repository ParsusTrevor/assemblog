var _       = require('lodash');
var EOL     = require('os').EOL;
var fs      = require('fs');
var request = require('request-promise');
var process = require('process');


function getMilestone(body, title) {

  var milestone;

  var data = JSON.parse(body);

  milestone = _.filter(data, function (item) {
    return item.title === title;
  })[0];

  return milestone;
};

function requestTickets(milestone, options, urlbase, page, tickets) {
  var ticketAccumulator = tickets || [];

  options.url = urlbase + 'tickets/milestone/' + milestone.id + '?per_page=100&ticket_status=all&page=' + page;
  return request(options)
     .then(function (body) {
       if(body.length == 0) return ticketAccumulator;

       var data = JSON.parse(body);    
       Array.prototype.push.apply(ticketAccumulator, data);
       return requestTickets(milestone, options, urlbase, ++page, ticketAccumulator);
      });
};

function getChangeLog(tickets, milestone) {
  var lines = [];

  var header = '## ' + milestone.title;

  lines.push(header);

  lines.push('### Added');
  _.map(tickets, function (ticket) {
    var entry = '- ' + ticket.summary + ' ([#' + ticket.number + '](' + 'http://www.assembla.com/spaces/acdhh/tickets/' + ticket.number + '))';

    lines.push(entry);
  });

  lines.push('### Changed');
  lines.push('### Fixed');

  return lines;

};

function writeChangeLog(changelog, lines) {
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

module.exports = {
  getMilestone: getMilestone,
  requestTickets: requestTickets,
  getChangeLog: getChangeLog,
  writeChangeLog: writeChangeLog
};
