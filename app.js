var request = require('request');
var EOL = require('os').EOL;
var fs      = require('fs');
var _       = require('lodash');


var API_KEY = process.env.API_KEY;
var API_SECRET = process.env.API_SECRET;

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

var milestoneId = '';
request(options, function (error, response, body) {
    if(!error && response.statusCode == 200) {
        var data = JSON.parse(body);

        milestoneId = _.filter(data, function (item) {
            return item.name === milestone;
        })[0];
    } else {
        console.log(response);
    }
});

options.url = urlbase + 'tickets';

var lines = [];

request(options, function (error, response, body) {
    if(!error && response.statusCode == 200) {
        var data = JSON.parse(body);

        var milestoneTickets = _.filter(data, function (item) {
            return item.milestone_id === milestoneId;
        });

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
    } else {
        console.log(response);
    }
});
