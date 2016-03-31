var request = require('request');
var _ = require('lodash');

var API_KEY = process.env.API_KEY;
var API_SECRET = process.env.API_SECRET;

var milestone = process.argv[2];

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

request(options, function (error, response, body) {
    if(!error && response.statusCode == 200) {
        var data = JSON.parse(body);

        var milestoneTickets = _.filter(data, function (item) {
            return item.milestone_id === milestoneId;
        });
        var header = '## ' + milestone;
        console.log(header);

        console.log('### Added');        
        _.map(data, function (ticket) {
            var entry = '- ' + ticket.summary + ' ([#' + ticket.number + '](' + 'http://www.assembla.com/spaces/acdhh/tickets/' + ticket.number + '))';

            console.log(entry);
        });

        console.log('### Changed');        
        console.log('### Fixed');
    } else {
        console.log(response);
    }
});
