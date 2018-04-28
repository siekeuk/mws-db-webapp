$ ->
  w2utils.settings.dataType = 'JSON';

  $('#grid').w2grid({
      name : 'grid',
      url  : '/search',
      method : 'POST',
      autoLoad: true,
      markSearch : false,
      show :
        toolbar         : true,
        toolbarReload   : false,
        toolbarColumns  : false,
        toolbarSearch   : true,
        toolbarAdd      : false,
        toolbarDelete   : false,
        toolbarSave     : false,
        footer : true

      toolbar:
        items:
          [
            {type : 'break'},
            {type : 'button'
            id : 'ad-search-btn'
            caption : 'Ad Search'
            onClick : -> baseData.setBaseData openAdvancedSearch},
            {type : 'break'},
            {type : 'spacer'},
            {type : 'break'},
            {type : 'button',
            id : 'help-btn',
            caption : 'Help',
            onClick : -> w2popup.open
              title: 'Help',
              width : 400,
              height :350,
              body : """
              <div class="help">

                <H2>詳細表示</H2>
                <div>
                  検索結果をダブルクリックすると、カード詳細ウィンドウが開きます。
                </div>

                <H2>ソート</H2>
                <div>
                  項目ヘッダー（Exp,Nameなど）をクリックすると、検索結果がソートされます。<br>
                  また、Ctrlキーを押しながらクリックすることでソート項目を複数選択することができます。<br>
                  複数ソート選択には選択順があり、選択された順から優先になります。<br>
                  1:Color, 2:Cost の昇順ソートがおすすめです。
                </div>

                <H2>動作環境</H2>
                <div>
                  IE以外ならそれなりに動くと思います。
                </div>

                <H2>バグ</H2>
                <div">
                  やまもり
                </div>

              </div>
                   """}
            {type: 'html', id: 'right-spacer', html: '<div style="margin-right:5px;"></div>'},
            {type: 'spacer'},
         ]
      buttons:
        'search-go':
          type: ''
        'search':
          type    : 'button',
          id        : 'search',
          html     : '<div class="aiueo"></div>'
      action: "no action",
      last:
        caption : 'Simple Search'

      onLoad: (event) ->
        w2popup.close();

      onRequest: (event) ->
          event.postData.action = this.action;

          if this.action is 'advanced-search'

              # simple-search, sortのreset
              this.customReset();
              this.searchReset();
              this.setBeforSearch(event.postData);
              $('#grid_grid_search_all').val("");
              $('#grid').removeData('simple-search');

              # ad-search param set
              event.postData.param = w2ui.advanced_search.getParams();
              $('#grid').data('advanced-search', event.postData.param);

          else if this.action is 'simple-search' and event.postData.search[0].value

              # ad-search, sortのreset
              this.customReset();
              this.setBeforSearch(event.postData);
              $('#grid').removeData('advanced-search');

              # simple-search param set
              event.postData.param = {freeWord : event.postData.search[0].value};
              $('#grid').data('simple-search', event.postData.param);

          else

              if $('#grid').data('simple-search')
                  event.postData.param = $('#grid').data('simple-search');
              else if $('#grid').data('advanced-search')
                  event.postData.param = $('#grid').data('advanced-search');

          this.action = 'After Request';

      onSort: (target, eventData) ->
          this.action = 'sort';

      onSearch: (event) ->
        unless event.searchData[0].value
          event.isCancelled = true;
          this.searchReset();

        if w2ui.advanced_search
          w2ui.advanced_search.recid  = 0;
          w2ui.advanced_search.record = {};
          $().w2tag();
          w2ui.advanced_search.refresh();

        this.action = 'simple-search';

      onRefresh: (event) ->

      onDblClick: (event) ->

        recid = event.recid;
        tarTr = $('#grid_grid_rec_'+recid);
        tarExp = tarTr.children('td').eq(0).children('div').attr('title');
        tarName = tarTr.children('td').eq(1).children('div').attr('title');
        url = '/card/'+latestReleaseDate+'/'+tarExp+'/'+tarName+'/'
        width = 640;
        height = 480;
        return windowOpen(url, url, width, height, {});

      columns:
        [
          {field: 'ex', caption: 'Exp', size: '35px', sortable: true}
          {field: 'cn', caption: 'Name', size: '200px', sortable: true}
          {field: 'cl', caption: 'Color', size: '50px', sortable: true}
          {field: 'mc', caption: 'Cost', size: '66px', sortable: true}
          {field: 'pt', caption: 'P/T', size: '50px', sortable: true}
          {field: 'ty', caption: 'Types', size:  '200px', sortable: true}
        ]

      customReset : ->
        this.offset = 0;
        this.total = 0;
        this.last.scrollTop = 0;
        this.last.scrollLeft = 0;
        this.last.selection.indexes = [];
        this.last.selection.columns = {};
        this.last.range_start = null;
        this.last.range_end = null;
        this.last.xhr_offset = 0;
        this.sortData = [];
        this.last.sortData = [];
        this.set({ expanded: false }, true);

      setBeforSearch : (postData) ->
        if postData.sort then postData.sort = [];
        if postData.offset then postData.offset = 0;

      searchReset : ->
        this.action = '';
        this.searchData  = [];
        this.last.search = '';
        this.last.logic  = 'OR';
        $("#grid_#{this.name}_search_all").val('');

      searches:
        [
          { type: 'text', field: 'freeWord'}
        ]
  });

  $("#search-button").click ->
      $("#search-button").prop('disabled',true);


eventFunc = ->
  $(document).on 'keydown', '.w2ui-field input', (e) ->
    if $('#w2ui-overlay').length
      if  e.keyCode is 37 or e.keyCode is 39 or e.keyCode is 27
        $('#w2ui-overlay').remove();

eventFunc();

# manual request
RequestObj = ->
  self = {};
  self.isNotRunning = true;

  self.searching = (param) ->
    if self.isNotRunning
      self.searchRequest param, (ended) ->
        self.isNotRunning = ended

  self.searchRequest = (param, callback) ->
    callback(false);
    w2ui.grid.request 'get-records', param, '/search', ->
      setTimeout (-> callback(true)), 1000;

  self.requestEvent = ->
    # FreeArea
    $("#grid_grid_search_all").keypress (e) ->
        if e.keyCode is 13
          param = {};
          w2ui.grid.action = 'simple-search';
          self.searching(param);
    # advanced search
    $(document).on 'click', '#ad-search-btn', ->
      param = {};
      w2ui.grid.action = 'advanced-search';
      self.searching(param);

    $(document).on 'keydown', '.w2ui-field input', (e) ->
      if e.keyCode is 13
        if w2ui.advanced_search
          unless $('.w2ui-drop-menu').length
            param = {};
            w2ui.grid.action = 'advanced-search';
            self.searching(param);

  return self;


# popupform
BaseData = ->
  self = {};
  self.baseData = {};
  self.requestInfo =
    [
      {type : 'cardType',   url : '/get-data/cardType'}
      {type : 'supertype',  url : '/get-data/supertype'}
      {type : 'subtype',    url : '/get-data/subtype' }
      {type : 'expansion',  url: '/get-data/expansion'}
    ]

  self.setBaseData = (callback) ->
    jqXHRList = [];
    unless self.baseData.cardType
      for value, i in self.requestInfo
        jqXHRList.push $.ajax
          url : value.url,
          type : 'POST',
          dataType : 'json'

      $.when.apply($, jqXHRList).done ->
        statuses = [];
        jqXHRResultList = [];
        for result,i2 in arguments
          self.baseData[self.requestInfo[i2].type] = result[0];
          statuses.push(result[1]);
          jqXHRResultList.push(result[3]);

        callback(self.baseData);

    else
      callback(self.baseData);
  return self;


requestObj = new RequestObj();
requestObj.requestEvent();
baseData = new BaseData();

openAdvancedSearch = (multiList) ->

  unless w2ui.advanced_search

    $().w2form
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
          '</div>'

      onSubmit: (event) ->

      getParams: ->
        params = {};
        $.each this.fields, (index, value) ->
          if value.type is 'text'
            if $.trim $('#'+value.name).val() then params[value.name] = $('#'+value.name).val();
          else if value.type is 'enum'
            ary = [];
            $('#'+value.name).siblings().children().children('ul').children('li').each ->
                text = $.trim($(this).text());
                if text
                  for key,value2 of value.options.items
                    if text is value2
                      if Array.isArray(value.options.items)
                        ary.push(value2);
                      else
                        ary.push(key);
                    else if text is value2.text
                      ary.push(value2.id);

            if ary.length then params[value.name] = ary;
        return params;

      fields:
        [
          {name: 'card_name', type: 'text'},
          {name: 'rule_text', type: 'text'},
          {name: 'expansion', type: 'enum', options:
            items: multiList.expansion,
            openOnFocus: true,
            placeholder: 'drop down',},
          {name: 'color', type: 'enum', options:
            items:
              [
                {id:'W', text:'白 (W)'}
                {id:'U', text:'青 (U)'}
                {id:'B', text:'黒 (B)'}
                {id:'R', text:'赤 (R)'}
                {id:'G', text:'緑 (G)'}
                {id:'', text:'無色'}
              ]
            style: '',
            openOnFocus: true,
            placeholder: 'drop down',},
          {name: 'supertype', type: 'enum', options:
            items: multiList.supertype,
            openOnFocus: true,
            placeholder: 'drop down',},
          {name: 'card_type', type: 'enum', options:
            items: multiList.cardType,
            openOnFocus: true,
            placeholder: 'drop down',},
          {name: 'subtype', type: 'enum', options:
            items: multiList.subtype,
            openOnFocus: true,
            placeholder: 'drop down',},
        ]

      actions:
        save: (event) ->
          this.getParams();
          event.isCancelled = true;
        reset: ->
          this.clear();

  $().w2popup 'open',
      title   : 'Advanced Search',
      body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
      style   : 'padding: 15px 0px 0px 0px',
      width   : 500,
      height  : 500,
      showMax : true,

      onToggle: (event) ->
        $(w2ui.advanced_search.box).hide();
        event.onComplete = ->
          $(w2ui.advanced_search.box).show();
          w2ui.advanced_search.resize();

      onOpen: (event) ->
        event.onComplete = ->
          # specifying an onOpen handler instead is equivalent to specifying an onBeforeOpen handler, which would make this code execute too early and hence not deliver.
          $('#w2ui-popup #form').w2render('advanced_search');
