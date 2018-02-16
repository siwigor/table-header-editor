# table-header-editor
jQuery plugin - Editor for table header.

Dependencies:
 jQuery
 jQuery-UI

Using:

var options = { header: '<thead><tr><th>First name</th><th>Last name</th><th>Position</th><th>Office</th><th>Start date</th><th>Salary</th></tr></thead>',
                submit: function (container, header) {
                  console.log(header);
                },
                cancel: function () {
                  console.log('close');
                }
              }
var headerEditor = $('body').headerEditor(options);
