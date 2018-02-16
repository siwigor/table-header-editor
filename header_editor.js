(function($){
     
  $.headerEditor = {
    defaults: {
      title: 'Header Editor',
      tmpl: '<div id="dt_header_editor" dt="editor" title="Header Editor">\n'+
            '  <button dt="ins_before" type="button" class="dt-header-editor-insert-row-before" title="Insert row before"></button>\n'+
            '  <button dt="ins_after" type="button" class="dt-header-editor-insert-row-after" title="Insert row After"></button>&nbsp;&nbsp;\n'+
            '  <button dt="join_right" type="button" class="dt-header-editor-join-right" title="Join right"></button>\n'+
            '  <button dt="join_left" type="button" class="dt-header-editor-join-left" title="Join left"></button>\n'+
            '  <button dt="join_above" type="button" class="dt-header-editor-join-above" title="Join above"></button>\n'+
            '  <button dt="join_below" type="button" class="dt-header-editor-join-below" title="Join below"></button>&nbsp;&nbsp;\n'+
            '  <button dt="remove" type="button" class="dt-header-editor-delete-row" title="Delete row"></button>&nbsp;&nbsp;\n'+
            '  <button dt="refresh" type="button" class="dt-header-editor-refresh" title="Refresh"></button><br><br>\n'+
            '  <table dt="table" width="100%" border="1" cellspacing="0">\n'+
            '  </table>\n'+
            '</div>',
      header: '',
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
      if (!options.header) {
        return;
      }
      var self = this;
      this.options = $.extend({}, this.defaults, options);
      this.container = container;
      this.create();
      this.initEditor();
      this.headerEditor.dialog({ autoOpen: true,
                                 modal: true,
                                 width: 640,
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
        
    initEditor: function () {
      this.headerEditor.find('table tr th').quickEdit({
        blur: false,
        checkold: true,
        space: false,
        maxLength: 50,
        showbtn: false,
        submit: function (dom, newValue) {
          dom.text(newValue);
        }
      });
    },
    
    create: function () {
      var headerEditor = $(this.options.tmpl).eq(0);
      headerEditor.find("table").html(this.options.header);
      headerEditor.appendTo(this.container);
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
      self.headerEditor.find('table').find('*').removeAttr('class style');
      self.headerEditor.find('table').find('*').filter(':not(table, thead, tfoot, tr, th)').remove();
      var newvalue = self.headerEditor.find('table').html();
      if (newvalue != options.header) {
        if ($.isFunction(options.submit)) {
          if (options.submit(self.container, newvalue) !== false) {
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
        self.initEditor();
      });
      
      scope.on('click.dt', "button[dt='ins_before']", function() {
        var sel_row = scope.find('th.dt-header-editor-cell-sel').closest('tr');   
        var new_row = self.newRow(sel_row.prev());
        var height = sel_row.height();
        new_row.insertBefore(sel_row).addClass('dt-header-editor-add-row').height(height);
        self.initEditor();
      });

      scope.on('click.dt', "button[dt='ins_after']", function() {
        var sel_row = scope.find('th.dt-header-editor-cell-sel').closest('tr');
        var new_row = self.newRow(sel_row.next());
        var height = sel_row.height();
        new_row.insertAfter(sel_row).addClass('dt-header-editor-add-row').height(height);
        self.initEditor();
      });

      scope.on('click.dt', "button[dt='remove']", function() {
        scope.find('th.dt-header-editor-cell-sel').closest('tr.dt-header-editor-add-row').remove();
        self.initEditor();
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
          var prev_cell = $(sel_row.prev().children()[col]);
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
          var next_cell = $($(sel_row.nextAll()[rowspan-1]).children()[col]);
          var next_rowspan = (next_cell.attr('rowspan'))?parseInt(next_cell.attr('rowspan')):1;
          if (next_cell.text())
            sel_cell.text(next_cell.text());  
          sel_cell.attr('rowspan',rowspan+next_rowspan);
          next_cell.remove();
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

(function ($) {
    $.quickEdit = {
        defaults: {
            prefix: '[qe=?]',
            oldvalue: '', 
            blur: false, 
            autosubmit: true, 
            checkold: true, 
            space: false, 
            maxlength: false,
            showbtn: true, 
            submit: function () {
            },
            cancel: function () {
            },
            tmpl: '<span qe="scope"><span><input type="text" qe="input"/></span><span><button qe="submit" >Okey</button><button qe="cancel">Cancel</button></span></span>'
        },

        init: function (dom, options) {
            if (!this.check(dom, options)) {
                return;
            }
            this.options = $.extend({}, this.defaults, options);
            this.dom = dom.hide();
            this.create();
            this.initEvent();
            return this.quickEdit;
        },

        check: function (dom) {
            if (this.quickEdit) {
                if (this.options.blur) {
                    this.options.autosubmit && this.submit() || this.cancel();
                } else {
                    this.hook = dom;
                    return;
                }
            }
            return true;
        },

        select: function (type) {
            return this.options.prefix.replace('?', type);
        },

        create: function () {
            var oldvalue = this.options.oldvalue;
            if (!oldvalue.length) {
                oldvalue = this.dom.text();
            }
            var quickEdit = $(this.options.tmpl).eq(0);
            quickEdit.find(this.select('input')).val(oldvalue);
            if (!this.options.showbtn) {
                this.options.blur = true;
                this.options.autosubmit = true;
                quickEdit.find(this.select('submit')).remove();
                quickEdit.find(this.select('cancel')).remove();
            }
            this.quickEdit = quickEdit;
        },

        submit: function () {
            var self = this,
                options = self.options;

            var newvalue = $.trim($(this.select('input'), self.quickEdit).val());
            if ((newvalue.length || options.space) && (newvalue != options.oldvalue || !options.checkold)) {
                if ($.isFunction(options.submit)) {
                    if (options.submit(self.dom, newvalue) !== false) {
                        self.cancel(true);
                    }
                }
            } else {
                self.cancel();
            }
        },

        cancel: function (nocall) {
            var self = this;
            if (!self.quickEdit) {
                return;
            }
            var cancel = function () {
                self.quickEdit.remove();
                self.quickEdit = undefined;
                self.dom.show();
                if (self.hook) {
                    self.hook.trigger('click');
                    self.hook = undefined;
                }
            };
            if (!nocall && $.isFunction(this.options.cancel)) {
                if (this.options.cancel(this.dom) !== false && this.quickEdit) {
                    cancel();
                }
            } else {
                cancel();
            }
        },

        initEvent: function () {
            var self = this,
                scope = self.quickEdit;

            scope.off('click.qe');
            scope.on('click.qe', self.select('submit'), function (e) {
                self.submit();
                e.stopPropagation();
            });

            scope.on('click.qe', self.select('cancel'), function (e) {
                self.cancel();
                e.stopPropagation();
            });

            scope.on('click.qe', self.select('input'), function (e) {
                e.stopPropagation();
            });

            scope.off('keydown.edit').on('keydown.edit', self.select('input'), function (e) {
                if (e.keyCode == 13) {
                    self.submit();
                    return false;
                }
                if (self.options.maxlength && $(this).val().length > self.options.maxlength) {
                    $(this).val($(this).val().substr(0, self.options.maxlength));
                }
            });

            $(document).off('click.qe').on('click.qe', function (e) {
                if (e.target == self.dom.get(0) || $(e.target).is(self.select('scope')) || $(e.target).parents(self.select('scope')).length) {
                    return;
                }
                if (self.options.blur) {
                    self.options.autosubmit && self.submit() || self.cancel();
                }
            });
        }
    };

    $.fn.quickEdit = function (arg1, arg2) {
        if (typeof arg1 == 'string') {
            switch (arg1) {
                case 'submit':
                    $.quickEdit.submit();
                    break;
                case 'cancel':
                    $.quickEdit.cancel();
                    break;
                case 'create':
                    return $.quickEdit.init($(this), arg2);
                    break;
            }
        } else {
            $(this).off('dblclick.qe');
            $(this).on('dblclick.qe', function () {
                var edit = $.quickEdit.init($(this), arg1);
                if (edit) {
                    $(this).after(edit);
                    $('input', edit)[0].select();
                }
            });
        }
    };
})(jQuery);

(function($){
    /* scan individual table and set "cellPos" data in the form { left: x-coord, top: y-coord } */
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
                for( ; m[y] && m[y][x]; ++x );  //skip already occupied cells in current row
                for( tx = x; tx < x + cspan; ++tx ) {  //mark matrix elements occupied by current cell with true
                    for( ty = y; ty < y + rspan; ++ty ) {
                        if( !m[ty] ) {  //fill missing rows
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

    /* plugin */
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
