var assemblog = require('../lib/assemblog');

var milestone = { id: 1, title: "0.10.0"};
describe('app', function () {
    it('gets milestone with title', function () {        
        var title = "0.10.0";
        
        var json = JSON.stringify([milestone]);
        console.log(json);
        expect(assemblog
               .getMilestone(json, title)
               .id)
               .toBe(1);
    });

    it('writes a changelog', function () {
        'use strict';
        
        var json = JSON.stringify([
            {
                id: 1,
                summary: 'first ticket',
                number: 1
            }]);

        var log = assemblog.getChangeLog(json, milestone);

        var entries = [
            '## 0.10.0',
            '### Added',
            '- first ticket ([#1](http://www.assembla.com/spaces/acdhh/tickets/1))',
            '### Changed',
            '### Fixed'
        ];

        for(let i=0; i < entries.length; i++) {
            expect(log[i]).toBe(entries[i]);
        }
    });
});
