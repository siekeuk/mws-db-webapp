/**
 *
 */
    $(function() {

        w2utils.settings.dataType = 'JSON';

        $('#grid').w2grid({
            name : 'grid',
            url  : '/search',
            method : 'POST',
            autoLoad: true,
            markSearch : false,
            show : {
//                header:true,
                toolbar         : true,
                toolbarReload   : false,
                toolbarColumns  : false,
                toolbarSearch   : true,
                toolbarAdd      : false,
                toolbarDelete   : false,
                toolbarSave     : false,
                footer : true
            },
            toolbar: { items : [{type : 'break'},
                                {type : 'button',
                                 id : 'ad-search-btn',
                                 caption : 'Ad Search',
//                                 img : 'icon-search',
                                 onClick : function() {baseData.setBaseData(openAdvancedSearch)}},
                                 {type : 'break'},
                                 {type : 'spacer'},
                                 {type : 'break'},
                                 {type : 'button',
                                  id : 'help-btn',
                                  caption : 'Help',
                                  onClick : function() {
                                      w2popup.open({
                                          title: 'Help',
                                          width : 400,
                                          height :350,
                                          body : '<div class=""><div style="padding: 10px;">'
                                               + ''
                                               + '<H2 style="display:block;font-size:1.17em;font-weight:bold;">'
                                               + '詳細表示'
                                               + '</H2>'
                                               + '<div style="padding: 5px 10px 10px 10px;">'
                                               + '検索結果をダブルクリックすると、カード詳細ウィンドウが開きます。'
                                               + '</div>'
                                               + '<H2 style="display:block;font-size:1.17em;font-weight:bold;">'
                                               + 'ソート'
                                               + '</H2>'
                                               + '<div style="padding: 5px 10px 10px 10px;">'
                                               + '項目ヘッダー（Exp,Nameなど）をクリックすると、検索結果がソートされます。<br>'
                                               + 'また、Ctrlキーを押しながらクリックすることでソート項目を複数選択することができます。<br>'
                                               + '複数ソート選択には選択順があり、選択された順から優先になります。<br>'
                                               + '1:Color, 2:Cost の昇順ソートがおすすめです。'
                                               + '</div>'
                                               + '<H2 style="display:block;font-size:1.17em;font-weight:bold;">'
                                               + '動作環境'
                                               + '</H2>'
                                               + '<div style="padding: 5px 10px 10px 10px;">'
                                               + 'IE以外ならそれなりに動くと思います。'
                                               + '</div>'
                                               + '<H2 style="display:block;font-size:1.17em;font-weight:bold;">'
                                               + 'バグ'
                                               + '</H2>'
                                               + '<div style="padding: 5px 10px 10px 10px;">'
                                               + 'やまもり'
                                               + '</div>'
                                               + ''
                                               + '</div></div>'
                                          });
                                       }
                                    },
                                 {type : 'html', id : 'right-spacer',
                                  html : '<div class="" style="margin-right:5px;"></div>'},
                                 {type : 'spacer'},
                               ],
            },
            buttons: {
                'search-go' : {
                    type    : '',
                },
                'search' : {
                    type    : 'button',
                    id        : 'search',
                    html     : '<div class="aiueo" style="" title=""></div>'
                },
                'search-go' : {
                    type    : '',
                }
            },
            action : "no action",
            last:{caption : 'Simple Search'},
            onLoad: function(event){
                w2popup.close();
            },
            onRequest: function(event) {

                event.postData.action = this.action;

                if(this.action === 'advanced-search'){

                    // simple-search, sortのreset
                    this.customReset();
                    this.searchReset();
                    this.setBeforSearch(event.postData);
                    $('#grid_grid_search_all').val("");
                    $('#grid').removeData('simple-search');

                    // ad-search param set
                    var test;
                    event.postData.param = w2ui.advanced_search.getParams();
                    $('#grid').data('advanced-search', event.postData.param);

                }else if(this.action === 'simple-search' && event.postData.search[0].value){

                    // ad-search, sortのreset
                    this.customReset();
                    this.setBeforSearch(event.postData);
                    $('#grid').removeData('advanced-search');

                    // simple-search param set
                    event.postData.param = {freeWord : event.postData.search[0].value};
                    $('#grid').data('simple-search', event.postData.param);

                }else{

                    if($('#grid').data('simple-search')){
                        event.postData.param = $('#grid').data('simple-search');
                    }else if($('#grid').data('advanced-search')){
                        event.postData.param = $('#grid').data('advanced-search');
                    }else{
                    }
                }

                this.action = 'After Request';

            },
            onSort: function(target, eventData) {
                this.action = 'sort';
            },
            onSearch: function(event) {
                if(!event.searchData[0].value){
                    event.isCancelled = true;
                    this.searchReset();
                }
                if(w2ui.advanced_search){
                    w2ui.advanced_search.recid  = 0;
                    w2ui.advanced_search.record = {};
                    $().w2tag();
                    w2ui.advanced_search.refresh();
                }
                this.action = 'simple-search';
            },
            onRefresh: function(event) {
            },
            onDblClick: function(event) {
                var height, url, width;
                var recid = event.recid;
                var tarTr = $('#grid_grid_rec_'+recid);
                var tarExp = tarTr.children('td').eq(0).children('div').attr('title');
                var tarName = tarTr.children('td').eq(1).children('div').attr('title');
                url = '/card/'+latestReleaseDate+'/'+tarExp+'/'+tarName+'/'
                width = 640;
                height = 480;
                return windowOpen(url, url, width, height, {});
            },
            columns : [
                        {field : 'ex', caption : 'Exp', size : '35px', sortable: true}
                      , {field : 'cn', caption : 'Name', size : '200px', sortable: true}
                      , {field : 'cl', caption : 'Color', size : '50px', sortable: true}
                      , {field : 'mc', caption : 'Cost', size : '66px', sortable: true}
                      , {field : 'pt', caption : 'P/T', size : '50px', sortable: true}
                      , {field : 'ty', caption : 'Types', size : '200px', sortable: true}
                      ],
            customReset : function(){
                this.offset                 = 0;
                this.total                  = 0;
                this.last.scrollTop         = 0;
                this.last.scrollLeft        = 0;
                this.last.selection.indexes = [];
                this.last.selection.columns = {};
                this.last.range_start       = null;
                this.last.range_end         = null;
                this.last.xhr_offset        = 0;
                this.sortData = [];
                this.last.sortData = [];
                this.set({ expanded: false }, true);
            },
            setBeforSearch : function(postData){
                if(postData.sort)postData.sort = [];
                if(postData.offset)postData.offset = 0;
            },
            searchReset : function(){
                this.action = '';
                this.searchData  = [];
                this.last.search = '';
                this.last.logic  = 'OR';
                $('#grid_'+ this.name +'_search_all').val('');
            },
            searches: [
                       { type: 'text', field: 'freeWord'},
                      ]
        });

        $("#search-button").click(function () {
            $("#search-button").prop('disabled',true);
        });
    });

    var eventFunc = function(){


        $(document).on('keydown', '.w2ui-field input', function(e) {
            if ($('#w2ui-overlay').length) {
                if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 27) {
                    $('#w2ui-overlay').remove();
                }
            }
        });


    }
    eventFunc();

    // manual request
    var RequestObj = function() {
        var self = {};
        self.isNotRunning = true;
        self.searching = function(param) {
            if (self.isNotRunning) {
                self.searchRequest(param, function(ended) {
                    self.isNotRunning = ended
                });
            }
        }
        self.searchRequest = function(param, callback) {
            callback(false);
//            w2ui.grid.reset(true);
            w2ui.grid.request('get-records', param, '/search', function() {
                setTimeout(function() {
                    callback(true)
                }, 1000);
            });
        }
        self.requestEvent = function() {
            // FreeArea
//            $("#search-area").keypress(function(e) {
            $("#grid_grid_search_all").keypress(function(e) {
                if (e.keyCode == 13) {
                    var param = {};
                    w2ui.grid.action = 'simple-search';
                    self.searching(param);
                }
            });
            // advanced search
            $(document).on('click', '#ad-search-btn', function() {
                var param = {};
                w2ui.grid.action = 'advanced-search';
                self.searching(param);
            });

            $(document).on('keydown', '.w2ui-field input', function(e) {
                if (e.keyCode == 13) {
                    if(w2ui.advanced_search){
                        if(!$('.w2ui-drop-menu').length){
//                            w2ui.advanced_search.action('save');
                            var param = {};
                            w2ui.grid.action = 'advanced-search';
                            self.searching(param);
                        }
                    }
                }
            });
        }
        return self;
    }

    // popupform
    var BaseData = function() {
        var self = {};
        self.baseData = {};
        self.requestInfo = [
                            // { type:'color', url: '/get-data/color'},
                            {type : 'cardType',   url : '/get-data/cardType'}
                            ,{type : 'supertype',  url : '/get-data/supertype'}
                            ,{type : 'subtype',    url : '/get-data/subtype' }
                            ,{type : 'expansion',  url: '/get-data/expansion'}
                            ];
        self.setBaseData = function(callback){
            var jqXHRList = [];
            if(!self.baseData.cardType){
                for (var i = 0; i < self.requestInfo.length; i++) {
                    jqXHRList.push($.ajax({
                        url : self.requestInfo[i].url,
                        type : 'POST',
                        dataType : 'json'
                    }));
                }
                $.when.apply($, jqXHRList).done(function() {
                    var statuses = [];
                    var jqXHRResultList = [];
                    for (var i = 0; i < arguments.length; i++) {
                        var result = arguments[i];
                        self.baseData[self.requestInfo[i].type] = result[0];
                        statuses.push(result[1]);
                        jqXHRResultList.push(result[3]);
                    }
                    callback(self.baseData);
                });
            }else{
                callback(self.baseData);
            }
        }
        return self;
    }

    var requestObj = new RequestObj();
    requestObj.requestEvent();
    var baseData = new BaseData();

    var openAdvancedSearch = function(multiList){

        if (!w2ui.advanced_search) {

            $().w2form({
                name: 'advanced_search',
                style: 'border: 0px; background-color: transparent;',
                formHTML:
                    '<div class="w2ui-page page-0">'+
                    '    <div class="w2ui-field">'+
                    '        <label>Card Name:</label>'+
                    '        <div>'+
                    '           <input name="card_name" id="card_name" type="text" maxlength="100" style="width: 250px"/>'+
                    '        </div>'+
                    '    </div>'+
                    '    <div class="w2ui-field">'+
                    '        <label>Rule Text:</label>'+
                    '        <div>'+
                    '            <input name="rule_text" id="rule_text" type="text" maxlength="100" style="width: 250px"/>'+
                    '        </div>'+
                    '    </div>'+
                    '    <div class="w2ui-field">'+
                    '        <label>Color:</label>'+
                    '        <div>'+
                    '           <input name="color" id="color" type="text" maxlength="100" style="width: 250px"/>'+
                    '        </div>'+
                    '    </div>'+
                    '    <div class="w2ui-field">'+
                    '        <label>Card Type:</label>'+
                    '        <div>'+
                    '            <input name="card_type" id="card_type" type="text" maxlength="100" style="width: 250px"/>'+
                    '        </div>'+
                    '    </div>'+
                    '    <div class="w2ui-field">'+
                    '        <label>Subtype:</label>'+
                    '        <div>'+
                    '            <input name="subtype" id="subtype" type="text" maxlength="100" style="width: 250px"/>'+
                    '        </div>'+
                    '    </div>'+
                    '    <div class="w2ui-field">'+
                    '        <label>Supertype:</label>'+
                    '        <div>'+
                    '            <input name="supertype" id="supertype" type="text" maxlength="100" style="width: 250px"/>'+
                    '        </div>'+
                    '    </div>'+
                    '    <div class="w2ui-field">'+
                    '        <label>Expansion:</label>'+
                    '        <div>'+
                    '            <input name="expansion" id="expansion" style="width: 250px"/>'+
                    '        </div>'+
                    '    </div>'+
                    '</div>'+
                    '<div class="w2ui-buttons">'+
                    '    <button class="btn" name="reset">Reset</button>'+
                    '    <button class="btn" name="save" id="ad-search-btn">Search</button>'+
                    '</div>',

                onSubmit: function(event) {
                },
                getParams: function() {
                    var params = {};
                    $.each(this.fields, function(index, value){
                        if(value.type == 'text'){
                            if($.trim($('#'+value.name).val()))params[value.name] = $('#'+value.name).val();
                        }
                        else if(value.type == 'enum'){
                            var ary = [];
                            $('#'+value.name).siblings().children().children('ul').children('li').each(function(){
                                var text = $.trim($(this).text());
                                if(text){
                                    for(var key in value.options.items){
                                        if(text == value.options.items[key]){
                                            if(Array.isArray(value.options.items)){
                                                ary.push(value.options.items[key]);
                                            }else{
                                                ary.push(key);
                                            }
                                        }else if(text == value.options.items[key].text){
                                            ary.push(value.options.items[key].id);
                                        }
                                    }
                                }
                            });
                            if(ary.length)params[value.name] = ary;
                        }
                    })

                    return params;
                },
                fields: [
                    { name: 'card_name', type: 'text'},
                    { name: 'rule_text', type: 'text'},
                    { name: 'expansion', type: 'enum',
                        options: {items: multiList.expansion,
                                  openOnFocus: true,
                                  placeholder: 'drop down',
                                  }
                    },
                    { name: 'color', type: 'enum',
                        options: {items: [
                                          {id:'W', text:'白 (W)'}
                                         ,{id:'U', text:'青 (U)'}
                                         ,{id:'B', text:'黒 (B)'}
                                         ,{id:'R', text:'赤 (R)'}
                                         ,{id:'G', text:'緑 (G)'}
                                         ,{id:'', text:'無色'}
                                          ],
                            style: '',
                            openOnFocus: true,
                            placeholder: 'drop down',
                        }
                    },
                    { name: 'supertype', type: 'enum',
                        options: {items: multiList.supertype,
                            openOnFocus: true,
                            placeholder: 'drop down',
                        }
                    },
                    { name: 'card_type', type: 'enum',
                        options: {items: multiList.cardType,
                            openOnFocus: true,
                            placeholder: 'drop down',
                        }
                    },
                    { name: 'subtype', type: 'enum',
                        options: {items: multiList.subtype,
                            openOnFocus: true,
                            placeholder: 'drop down',
                        }
                    },
                ],
                actions: {
                    "save": function (event) {
                        this.getParams();
                        event.isCancelled = true;
                        },
                    "reset": function () {
                        this.clear();
                        },
                }
            });
        }

        $().w2popup('open', {
            title   : 'Advanced Search',
            body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
            style   : 'padding: 15px 0px 0px 0px',
            width   : 500,
            height  : 500,
            showMax : true,
            onToggle: function (event) {
                $(w2ui.advanced_search.box).hide();
                event.onComplete = function () {
                    $(w2ui.advanced_search.box).show();
                    w2ui.advanced_search.resize();
                }
            },
            onOpen: function (event) {
                event.onComplete = function () {
                    // specifying an onOpen handler instead is equivalent to specifying an onBeforeOpen handler, which would make this code execute too early and hence not deliver.
                    $('#w2ui-popup #form').w2render('advanced_search');
                }
            }
        });
    }
