(function($){
     
  $.headerEditor = {
    defaults: {
      title: 'Header Editor',
      tmpl: '<div id="dt_header_editor" class="dt-header-editor" dt="editor" title="Header Editor">\n'+
            '  <button dt="ins_before" type="button" class="dt-header-editor-insert-row-before" title="Insert row before"></button>\n'+
            '  <button dt="ins_after" type="button" class="dt-header-editor-insert-row-after" title="Insert row After"></button>&nbsp;&nbsp;\n'+
            '  <button dt="join_right" type="button" class="dt-header-editor-join-right" title="Join right"></button>\n'+
            '  <button dt="join_left" type="button" class="dt-header-editor-join-left" title="Join left"></button>\n'+
            '  <button dt="join_above" type="button" class="dt-header-editor-join-above" title="Join above"></button>\n'+
            '  <button dt="join_below" type="button" class="dt-header-editor-join-below" title="Join below"></button>&nbsp;&nbsp;\n'+
            '  <button dt="remove" type="button" class="dt-header-editor-delete-row" title="Delete row"></button>&nbsp;&nbsp;\n'+
            '  <button dt="refresh" type="button" class="dt-header-editor-refresh" title="Refresh"></button><br>\n'+
            '</div>',
      header_tmpl: '<br>Header<br><table dt="table_header" width="100%" border="1" cellspacing="0"></table>', 
      footer_tmpl: '<br>Footer<br><table dt="table_footer" width="100%" border="1" cellspacing="0"></table>',
      header: '',
      footer: '',
      submit: function () {
      },
      cancel: function () {
      }
    },
    
    init: function (container, options) {
      if (this.headerEditor) {
        this.headerEditor.dialog("open");
        return this.headerEditor;
      }
      var self = this;
      this.options = $.extend({}, this.defaults, options);
      this.container = container;
      this.create();
      this.headerEditor.dialog({ autoOpen: true,
                                 modal: true,
                                 width: 1000,
																 height: 350,
                                 buttons: [ { text: "Cancel",
                                              click: function() {
                                               $( this ).dialog( "close" );
                                               $( this ).dialog( "destroy" ); 
                                               self.cancel();
                                             }
                                            }, 
                                           { text: "OK",
                                             click: function() {
                                              $( this ).dialog( "close" );
                                              $( this ).dialog( "destroy" );  
                                              self.submit(); 
                                            }
                                           }
                                          ]
                               });
      this.initEvent();     
      return this.headerEditor;
    },
        
    initEditorEvent: function () {
      this.headerEditor.off('.dth_cell_editor');
      this.headerEditor.on('dblclick.dth_cell_editor', 'table tr th', function () {
        var value = $(this).text();
        var width = $(this).width();
        $(this).addClass('dth-editing-cell')
        $(this).html('<input id="dth_cell_editor" class="dth-cell-editor" size="' + Math.round(width/8).toString() + '" type="text" value="' + value + '">');
        $(this).width(width);
        $('#dth_cell_editor').on('keyup.dth_cell_editor keypress.dth_cell_editor focus.dth_cell_editor blur.dth_cell_editor change.dth_cell_editor', function( event ) {
          var edit = $(this);
          edit.width(parseInt((edit.val().length + 3) * 8));
        });
      });
    },
    
    create: function () {
      var headerEditor = $(this.options.tmpl).eq(0);
      headerEditor.attr('title',this.options.title);
      if (this.options.header || this.options.footer) {
        if (this.options.header) {
          headerEditor.append(this.options.header_tmpl);
          headerEditor.find("table[dt='table_header']").html('<thead>' + this.options.header + '</thead>');
        }
        if (this.options.footer) {
          headerEditor.append(this.options.footer_tmpl);
          headerEditor.find("table[dt='table_footer']").html('<tfoot>' + this.options.footer + '</tfoot>');
        }
      } else {
        if ($.fn.DataTable && $.fn.DataTable.isDataTable(this.container)) {
          var table = $(this.container).DataTable();
          var header = $(table.table().header()).clone();
          if (header.length) {
            header.find('*').removeAttr('class style role aria-label aria-controls aria-sort tabindex');
            header.filter(':not(table, thead, tfoot, tr, th)').remove();
            header.find("th[rowspan='1']").removeAttr('rowspan');
            header.find("th[colspan='1']").removeAttr('colspan');
            this.options.header = header.html().replace(/\r\n|\n|\t/g,'').replace(/\s\s+/g,' ').trim();
            console.log(this.options.header);
            headerEditor.append(this.options.header_tmpl);
            headerEditor.find("table[dt='table_header']").append(header);
          }
          var footer = $(table.table().footer()).clone();
          if (footer.length) {
            footer.find('*').removeAttr('class style role aria-label aria-controls aria-sort tabindex');
            footer.filter(':not(table, thead, tfoot, tr, th)').remove();
            footer.find("th[rowspan='1']").removeAttr('rowspan');
            footer.find("th[colspan='1']").removeAttr('colspan');
            this.options.footer = footer.html().replace(/\r\n|\n|\t/g,'').replace(/\s\s+/g,' ').trim();
            console.log(this.options.footer);
            headerEditor.append(this.options.footer_tmpl);
            headerEditor.find("table[dt='table_footer']").append(footer);
          }
        }
      }
      headerEditor.insertAfter(this.container);
      this.headerEditor = headerEditor;
    },
    
    newRow: function (row) {
      var self = this;
      var col;
      var tr = $('<tr></tr>');
      if (row.length === 0) {
        col = Math.max.apply(null, self.headerEditor.find('table tr').map(function() { return $(this).children().length ; }).get());
      } else {
        col = row.children().map(function() { return ($(this).attr('colspan'))?parseInt($(this).attr('colspan')):1; }).get().reduce(function(a, b) { return a + b; }, 0);
      }
      for (i = 0; i < col; i++) {
        tr.append('<th></th>');
      }
      tr.on('click.dt', 'th', function () {
        self.headerEditor.find('table tr th').removeClass('dt-header-editor-cell-sel');
        $(this).toggleClass('dt-header-editor-cell-sel');
      });
      return tr;
    },
    
    submit: function () {
      var self = this,
          options = self.options;
      self.headerEditor.find('table').find('*').removeAttr('class style role aria-label aria-controls aria-sort tabindex');
      self.headerEditor.find('table').find('*').filter(':not(table, thead, tfoot, tr, th)').remove();
      var header = '';
      if (self.headerEditor.find("table[dt='table_header'] thead").length) {
        header = self.headerEditor.find("table[dt='table_header'] thead").html().replace(/\r\n|\n|\t/g,'').replace(/\s\s+/g,' ').trim();
      }
      var footer = '';
      if (self.headerEditor.find("table[dt='table_footer'] tfoot").length) {
        footer = self.headerEditor.find("table[dt='table_footer'] tfoot").html().replace(/\r\n|\n|\t/g,'').replace(/\s\s+/g,' ').trim();
      }
      if (header != options.header || footer != options.footer) {
        if ($.isFunction(options.submit)) {
          if (options.submit(self.container, header, footer) !== false) {
            self.cancel(true);
          }
        }
      } else {
        self.cancel();
      }
    },

    cancel: function (nocall) {
      var self = this;
      if (!self.headerEditor) {
        return;
      }
      var cancel = function () {
        self.headerEditor.remove();
        self.headerEditor = undefined;
      };
      if (!nocall && $.isFunction(this.options.cancel)) {
        if (this.options.cancel(this.container) !== false && this.headerEditor) {
          cancel();
        }
      } else {
        cancel();
      }
    },
    
    initEvent: function () {
      var self = this,
          scope = self.headerEditor;
      
      scope.off('click.dt');
      
      scope.on('click.dt', 'table tr th', function () {
        scope.find('table tr th').removeClass('dt-header-editor-cell-sel');
        $(this).toggleClass('dt-header-editor-cell-sel');
      });
      
      scope.on('click.dt', "button[dt='refresh']", function() {
        scope.find("table").html(self.options.header);
        self.initEditorEvent();
      });
      
      scope.on('click.dt', "button[dt='ins_before']", function() {
        var sel_row = scope.find('th.dt-header-editor-cell-sel').closest('tr');   
        var new_row = self.newRow(sel_row.prev());
        var height = sel_row.height();
        new_row.insertBefore(sel_row).addClass('dt-header-editor-add-row').height(height);
        self.initEditorEvent();
      });

      scope.on('click.dt', "button[dt='ins_after']", function() {
        var sel_row = scope.find('th.dt-header-editor-cell-sel').closest('tr');
        var new_row = self.newRow(sel_row.next());
        var height = sel_row.height();
        new_row.insertAfter(sel_row).addClass('dt-header-editor-add-row').height(height);
        self.initEditorEvent();
      });

      scope.on('click.dt', "button[dt='remove']", function() {
        scope.find('th.dt-header-editor-cell-sel').closest('tr.dt-header-editor-add-row').remove();
        self.initEditorEvent();
      });

      scope.on('click.dt', "button[dt='join_right']", function() {
        var colcount = scope.find('tr:not(.dt-header-editor-add-row)').children().length;
        var sel_cell = scope.find('tr.dt-header-editor-add-row th.dt-header-editor-cell-sel');
        var colspan = (sel_cell.attr('colspan'))?parseInt(sel_cell.attr('colspan')):1;
        if (colspan < colcount && sel_cell.next().length > 0) {
          var next_colspan = (sel_cell.next().attr('colspan'))?parseInt(sel_cell.next().attr('colspan')):1;
          sel_cell.attr('colspan',colspan+next_colspan);
          sel_cell.next().remove();
        }
      });

      scope.on('click.dt', "button[dt='join_left']", function() {
        var colcount = scope.find('tr:not(.dt-header-editor-add-row)').children().length;
        var sel_cell = scope.find('tr.dt-header-editor-add-row th.dt-header-editor-cell-sel');
        var colspan = (sel_cell.attr('colspan'))?parseInt(sel_cell.attr('colspan')):1;
        if (colspan < colcount && sel_cell.prev().length > 0) {
          var prev_colspan = (sel_cell.prev().attr('colspan'))?parseInt(sel_cell.prev().attr('colspan')):1;
          sel_cell.attr('colspan',colspan+prev_colspan);
          sel_cell.prev().remove();
        }
      });

      scope.on('click.dt', "button[dt='join_above']", function() {
        var sel_cell = scope.find('th.dt-header-editor-cell-sel');
        var sel_row = sel_cell.closest('tr');
        var cell_pos = sel_cell.cellPos();
        var row = cell_pos.top;
        var col = cell_pos.left;
        var rowspan = (sel_cell.attr('rowspan'))?parseInt(sel_cell.attr('rowspan')):1;
        if (sel_row.prev().length > 0) {
          var prev_cell = $(sel_row.prev().children().filter(function(index, element) { return $(this).cellPos().left == col; })[0]);
          var prev_rowspan = (prev_cell.attr('rowspan'))?parseInt(prev_cell.attr('rowspan')):1;
          if (sel_cell.text())
            prev_cell.text(sel_cell.text());  
          prev_cell.attr('rowspan',prev_rowspan+rowspan);
          sel_cell.remove();
        }
      });

      scope.on('click.dt', "button[dt='join_below']", function() {
        var sel_cell = scope.find('th.dt-header-editor-cell-sel');
        var sel_row = sel_cell.closest('tr');
        var cell_pos = sel_cell.cellPos();
        var row = cell_pos.top;
        var col = cell_pos.left;
        var rowspan = (sel_cell.attr('rowspan'))?parseInt(sel_cell.attr('rowspan')):1;
        if (sel_row.next().length > 0) {
          var next_cell = $($(sel_row.nextAll()[rowspan-1]).children().filter(function(index, element) { return $(this).cellPos().left == col; })[0]);
          var next_rowspan = (next_cell.attr('rowspan'))?parseInt(next_cell.attr('rowspan')):1;
          if (next_cell.text())
            sel_cell.text(next_cell.text());  
          sel_cell.attr('rowspan',rowspan+next_rowspan);
          next_cell.remove();
        }
      });
      
      self.initEditorEvent();
      
      $(document).on('click.dth_cell_editor', function (e) {
        if (e.target == $('th.dth-editing-cell').get(0) || $(e.target).is($('#dth_cell_editor'))) {
          return;
        }
        if ($('#dth_cell_editor').length) {
          var value = $('#dth_cell_editor').val();
          $('#dth_cell_editor').off('.dth_cell_editor');
          $('#dth_cell_editor').remove();
          $('th.dth-editing-cell').text(value);
          $('th.dth-editing-cell').removeClass('dth-editing-cell');
        }
      });
   
      scope.dialog('widget').on('click.dt', 'button.ui-dialog-titlebar-close', function (e) {
        self.cancel();
        e.stopPropagation();
      });
    }   
  };
  
  $.fn.headerEditor = function (options) {
    
    return $.headerEditor.init($(this), options);
  };
})(jQuery);

(function($){
    function scanTable( $table ) {
        var m = [];
        $table.children( "tr" ).each( function( y, row ) {
            $( row ).children( "td, th" ).each( function( x, cell ) {
                var $cell = $( cell ),
                    cspan = $cell.attr( "colspan" ) | 0,
                    rspan = $cell.attr( "rowspan" ) | 0,
                    tx, ty;
                cspan = cspan ? cspan : 1;
                rspan = rspan ? rspan : 1;
                for( ; m[y] && m[y][x]; ++x );
                for( tx = x; tx < x + cspan; ++tx ) {
                    for( ty = y; ty < y + rspan; ++ty ) {
                        if( !m[ty] ) {
                            m[ty] = [];
                        }
                        m[ty][tx] = true;
                    }
                }
                var pos = { top: y, left: x };
                $cell.data( "cellPos", pos );
            } );
        } );
    };
    $.fn.cellPos = function( rescan ) {
        var $cell = this.first(),
            pos = $cell.data( "cellPos" );
        if( !pos || rescan ) {
            var $table = $cell.closest( "table, thead, tbody, tfoot" );
            scanTable( $table );
        }
        pos = $cell.data( "cellPos" );
        return pos;
    }
})(jQuery);
