
marker =
  lnd: 'Lands',
  cre: 'Creatures',
  spl: 'Spells',
  sb: 'Sideboard',


#データ取ってくるクラス
GetData = ->
  self = {};

  self.requestInfo =
    url: window.location.origin + '/get-data/card'
    releaseDate: ''
    reqCard: []

  if  /\d{8,}/.test(location.pathname.split('/')[(location.pathname.split('/').indexOf('deck')+1)])
    self.requestInfo.releaseDate = location.pathname.split('/')[(location.pathname.split('/').indexOf('deck')+1)]
  else
    self.requestInfo.releaseDate = latestReleaseDate

  self.responseInfo =
    deckNo: 0
    deckName: ''
    uploader: ''
    deck:
      comment : ''
      cardInfo: []

  self.jqXHRList = [];

  self.getCardInfo = (callback) ->
    jqXHRList = [];
    if self.requestInfo.reqCard?
      console.dir self.requestInfo.reqCard
      for reqCardInfo,i in self.requestInfo.reqCard
        jqXHRList.push $.ajax
          url: self.requestInfo.url + '/' +
          self.requestInfo.releaseDate + '/' +
          reqCardInfo.expansion + '/' +
          encodeURI(reqCardInfo.cardName.eng) + '/',
          type: 'POST',
          dataType: 'json',
          timeout: 15000,

      $.when.apply($, jqXHRList).done ->
        statuses = [];
        jqXHRResultList = [];
        self.responseInfo.deck.cardInfo = [];
        for resVal,j in arguments
          self.responseInfo.deck.cardInfo.push(resVal[0]);
          #successじゃなかったらダメにする処理
          statuses.push(resVal[1]);
          jqXHRResultList.push(resVal[3]);

        callback(self.requestInfo, self.responseInfo);

    else
      callback();

  return self;

#
getData = new GetData;

######################################
#初回読み込み時にデッキデータを取得する
#
initResolver = (callback) ->
  $.ajax
    url: '/get-data' + location.pathname,
    type: 'POST',
    dataType: 'json',
    data:
      reqCard: []
  .done (resData) ->
    console.log 'initResolver success'
    console.log resData
    unless getData.responseInfo.deckNo
      getData.responseInfo.deckNo = resData.deckNo
      getData.responseInfo.deck = resData.deck
    createDeckInfoTable {reqCard: getData.responseInfo.deck.cardInfo}, resData;
    callback()
  .fail (resData) ->
    alert 'successResolver_ng!'

##########################################
#編集可不可を切り替える
#editFlgがtrueやとreadOnlyはfalse
#
toggleEdit = () ->
  editFlg = Boolean($('tfoot tr.none-disp').length)
  if editFlg
    $('tfoot input[type=text], tfoot textarea')
    .attr('readonly', false)
    .removeClass('readOnly');
    $('.edit-line').removeClass("none-disp");
  else
    $('tfoot input[type=text], tfoot textarea')
    .attr('readonly', true)
    .addClass('readOnly');
    $('.edit-line').addClass("none-disp");

##########################################
#初回読み込み時の画面状態を作成する
#
editState = () ->
  entryFlg = Boolean (not getData.responseInfo.deckNo)
  delFlg = Boolean (getData.responseInfo.delFlg)
  if delFlg
    $('tfoot input[type=text], tfoot textarea')
    .attr('readonly', true)
    .addClass('readOnly');
    $('.edit-line').addClass("none-disp");
    $('.upload').addClass("none-disp");
    $('.download').addClass("none-disp");
    $('.delete').addClass("none-disp");
  else if entryFlg
    $('tfoot input[type=text], tfoot textarea')
    .attr('readonly', false)
    .removeClass('readOnly');
    $('.edit-line').removeClass("none-disp");
    $('.upload').removeClass("none-disp");
    $('.download').addClass("none-disp");
    $('.delete').addClass("none-disp");
  else
    $('tfoot input[type=text], tfoot textarea')
    .attr('readonly', true)
    .addClass('readOnly');
    $('.edit-line').addClass("none-disp");
    $('.upload').addClass("none-disp");
    $('.download').removeClass("none-disp");

##########################################
#デッキのダウンロードを行う
#
downloadDeckData = () ->
  $.ajax
    url: '/get-data/deck/download'
    type: 'POST'
    dataType: 'json'
    data:
      releaseDate: getData.requestInfo.releaseDate
      deckNo: getData.responseInfo.deckNo
  .done (resData) ->
    blob = new Blob([resData.mwsDeckData]);
    url = window.URL || window.webkitURL;
    if navigator.msSaveBlob
      navigator.msSaveBlob(blob, resData.deckName);
    else
      blobURL = url.createObjectURL(blob);
      a = document.createElement('a');
      a.download = resData.deckName;
      a.href = blobURL;
      a.click();
    console.log 'downloadDeckData success'
  .fail (resData) ->
    alert 'nanka dl dekinyo!!'

################################################
#deckInfoを登録・更新する
#
entryDeck = (responseInfo) ->
  if responseInfo.deck?
    $.ajax
      url: '/put-data/deck/entry',
      type: 'POST',
      dataType: 'json',
      data:
        releaseDate: getData.requestInfo.releaseDate
        deckNo : responseInfo.deckNo || location.pathname.split(/\//).filter(Boolean).pop()
        deckName: $('#deckName').val() || responseInfo.deckName
        uploader: $('#uploader').val() || responseInfo.uploader
        editKey: $('#editKey').val()
        delFlg: $('#delFlg:checked').val()
        deck:
          [
            comment : $('#comment').val() || responseInfo.deck.comment
            cardInfo : responseInfo.deck.cardInfo
        ]
    .done (data) ->
      if data.result is 'success'
        getData.responseInfo.deckNo or= data.deckNo
        getData.responseInfo.delFlg or= data.delFlg
        $('#header_deckName').text($('#deckName').val() || responseInfo.deckName)
        $('#header_uploader').text($('#uploader').val() || responseInfo.uploader)
        editState()
        window.opener?.w2ui['deckList']?.reset()
        alert data.message
      else
        alert data.message
    .fail (data) ->
      alert 'ng!'

##########################################
do ->
  if /\/deck\/\d{8}\/\d{5,}\//.test location.pathname
    initResolver(editState);
  else if /\/deck\/entry/.test location.pathname
    $('#header_deckName').text ''
    $('#deckName').val ''
    $('#header_uploader').html ''
    $('#uploader').val '名も無きプレインズウォーカー'
    $('#comment').text ''
    editState()

##########################################
#click event
#
$ document
.on 'click', '#upload',  ->
  #必須チェック
  if $('#editKey').val()
    entryDeck(getData.responseInfo)
  else
    alert 'Edit Keyは必須です。'
.on 'click', 'input#edit',  ()->
  toggleEdit()
.on 'click', 'input#download',  ()->
  downloadDeckData()
.on 'click', 'a.cardlink', (e) ->
  e.preventDefault()
  width = 640
  height = 480
  url = e.target.href
  windowOpen url, url, width, height, {}

#ファイルが指定されたタイミングで、その内容を表示
do ->
  window.addEventListener 'DOMContentLoaded', ->

    if document.getElementById('file')?

      try

        document.querySelector('#file').addEventListener 'change', (e) ->

          #File APIを利用できるかをチェック
          if window.File?

            #指定されたファイルを取得
            inputFile = document.querySelector('#file').files[0];

            #ファイル読み込みの準備（1）
            reader = new FileReader();

            #ファイルの読み込みに成功したら、その内容を<div id='result'>に反映（2）
            reader.addEventListener 'load', (e) ->

              localDeckData =
                deckName: ''
                cardInfo: []

              table;

              codes = new Uint8Array(e.target.result);
              encoding = Encoding.detect(codes);
              #Convert encoding to unicode
              unicodeString = Encoding.convert(codes, {
                to: 'unicode',
                from: encoding,
                type: 'string'
              });
              spliter = unicodeString.split('//');
              mwsSplit = {};
              for cardText,i in spliter
                cardText = cardText.replace(/(^\s+)|(\s+$)|(SB: )/g, '');
                for key,value of marker
                  if cardText.lastIndexOf(value, 0) is 0
                    mwsSplit[value] = cardText.split(/\r\n|\r|\n/);

                    for val,j in mwsSplit[value][1...mwsSplit[value].length]
                      lineData;
                      cardInfo =
                        expansion: ''
                        cardName:
                          jpn: ''
                          eng: ''
                        count: 0,
                        category: ''

                      #mwsDeckのカード行をparseし各値の配列を作成する
                      lineData = mwsSplit[value][j + 1].split(/\[|\]/);

                      #作成した配列をカード情報用オブジェクトにセットし、ローカルデッキ情報へ追加する
                      cardInfo.count = Number(lineData[0].replace(/(^\s+)|(\s+$)/g, ''));
                      cardInfo.expansion = lineData[1].replace(/(^\s+)|(\s+$)/g, '');
                      cardInfo.cardName.eng = lineData[2].replace(/(^\s+)|(\s+$)/g, '');
                      cardInfo.category = value;

                      localDeckData.cardInfo.push(cardInfo);

              #uploadされたファイルの拡張子部分を取り除き、デッキ名フィールドへセットする
              localDeckData.deckName = inputFile.name.match(/(.*)(?:\.([^.]+$))/)[1];
              console.dir localDeckData
              document.getElementById('deckName').value or= localDeckData.deckName

              #操作するテーブルへの参照を取得
              table = document.getElementById('test_table');
              tbody = document.getElementById('deckInfo_tbody');

              #カード情報初期化
              for key,value of marker
                elem = document.getElementById(value.toLowerCase());
                while (elem.childNodes.length - 1)
                  elem.removeChild(elem.lastChild);

              if getData.requestInfo?.reqCard?
                getData.requestInfo.reqCard = []
              for i,localCardInfo of localDeckData.cardInfo
                getData.requestInfo.reqCard.push(localCardInfo);

              getData.getCardInfo(createDeckInfoTable);

            , true

            try
              # ファイルの内容をバイナリで取得、イベントハンドラ内で文字コード判別しテキスト変換
              reader.readAsArrayBuffer(inputFile);
            catch error
              console.log error

        , true

      catch error
        console.log error


#
#req,resをもってテーブルにデッキ情報を展開する
#
createDeckInfoTable = (reqData, resData) ->

  console.log 'start createDeckInfoTable'
  console.dir reqData

  innerHtmlObj =
    Lands: '',
    Creatures: '',
    Spells: '',
    Sideboard: '',
    LandsCount: 0,
    CreaturesCount: 0,
    SpellsCount: 0,
    SideboardCount: 0,

  reqDeckCardData = reqData.reqCard;
  resDeckCardData = resData.deck.cardInfo;

  for resCardInfo,i in resDeckCardData

    category = resCardInfo.category || reqDeckCardData[i].category;
    count = resCardInfo.count || reqDeckCardData[i].count

    unless resCardInfo.error
      url = "http://#{location.host}/card/#{getData.requestInfo.releaseDate}/#{resCardInfo.expansion}/#{resCardInfo.cardName.jpn}/"
      innerHtmlObj[category] += '<span>';
      innerHtmlObj[category] += ('\u00a0' + count).slice(-2);
      innerHtmlObj[category] += ':';
      innerHtmlObj[category] += "《<a class='cardlink' target='_blank' href='#{url}'>"
      innerHtmlObj[category] += resCardInfo.cardName.jpn;
      innerHtmlObj[category] += '</a>》</span><br>';

      innerHtmlObj[category + 'Count'] += count;

      resCardInfo.category = category;
      resCardInfo.count = count;

    else
      alert(reqDeckCardData[i]?.cardName?.eng + ':これがサーバーから情報ひけずにエラーが出てる');

  for key,value of marker
    cardInfoDiv = document.getElementById(value.toLowerCase());
    innerHtmlObj[value] += '<HR>';
    innerHtmlObj[value] += '<span class="cardtotal">-';
    innerHtmlObj[value] += [value];
    innerHtmlObj[value] += "（#{innerHtmlObj[value + 'Count']}）";
    innerHtmlObj[value] += '-</span><BR>';
    cardInfoDiv.innerHTML = innerHtmlObj[value];

  document.getElementById('header_deckName').innerText or= resData.deckName;
  document.getElementById('deckName').value or= resData.deckName;
  document.getElementById('header_uploader').innerText or= resData.uploader;
  document.getElementById('uploader').value or= resData.uploader;
  document.getElementById('comment').value or= resData.deck.comment;

  pastFlg = Boolean (getData.requestInfo.releaseDate < latestReleaseDate)
  if pastFlg
    $('#download-messeage').text('最新セットのデッキではありません。').addClass('warning')
    $('#upload-messeage').text('カード構成の編集はできません。').addClass('warning')
    $('#file').css('display', 'none')

do ->
  w2utils.settings.dataType = 'JSON';

  $('#deckList').w2grid

    name: 'deckList'
    url: '/deck/get-list'
    method: 'POST'
    autoLoad: true
    markSearch: false
    header: 'Master'

    show:
      toolbar: true
      toolbarReload: false
      toolbarColumns: false
      toolbarSearch: false
      toolbarAdd: false
      toolbarDelete: false
      toolbarSave: false
      footer: true

    columns: [
      { field: 'color', caption: 'Color', size: '45px', sortable: false }
      { field: 'deckName', caption: 'Deck Name', size: '197px', sortable: false }
      { field: 'uploader', caption: 'Uploader', size: '135px', sortable: false }
      { field: 'firstEntry', caption: 'First Entry', size: '112px' }
      { field: 'lastUpdated', caption: 'Last Updated', size: '112px' }
      { field: 'releaseDate'}
      { field: 'deckNo'}
    ]

    toolbar:
      items: [
        {type: 'button'
        id: 'deck-entry'
        caption: 'Entry Deck'
        onClick: ->
          url = '/deck/entry';
          width = 640;
          height = 600;
          winStats = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=' + width + ', height=' + height;
          target = 'deckInfoEntry'
          windowOpen url, target, width, height, null}
        { type: 'break' }
        { type: 'spacer' }
        { type: 'break' }
        {type : 'button', id: 'help-btn', caption: 'Help', onClick : ->
              w2popup.open
                  title: 'Help',
                  width : 400,
                  height :350,
                  body : """
                  <div class="help">

                    <H2>詳細表示</H2>
                    <div>
                      検索結果をダブルクリックすると、デッキ詳細ウィンドウが開きます。
                    </div>

                    <H2>登録</H2>
                    <div>
                      明細枠左上の方にある[Entry Deck]ボタンからデッキ登録できます。<br>
                      Magic Workstation形式のデッキファイルしか登録できません。ファイルチェックしてないのであんま変なファイルあげようとすると何が起こるかわかりません。<br>
                      最新一括のデッキしか登録できません。正確には、最新一括にカード名が存在するデッキしか登録できません。
                    </div>

                    <H2>更新</H2>
                    <div>
                      デッキ詳細ウィンドウから[Edit]ボタンでデッキのUploadし直しやコメント等の更新ができます。登録時に設定した[Edit Key]が必須です。<br>
                      最新一括のデッキではない場合、カード構成の更新はできません。デッキ名などの変更や削除は可能です。
                    </div>

                    <H2>削除</H2>
                    <div>
                      登録時に設定した[Edit Key]を入力後、[Delete]にチェック入れて[Upload]ボタンを押してください。
                    </div>

                    <H2>その他</H2>
                    <div>
                      不具合、未実装、仕様が入り混じってるので適当にどうぞ。<BR>
                    </div>

                  </div>
                       """ }
        { type: 'html', id: 'right-spacer', html: '<div class="" style="margin-right:5px;"></div>' }
        { type: 'spacer' }
      ]

    onDblClick: (event) ->
      tarTr = $('#grid_deckList_rec_' + event.recid);
      tarReleaseDate = tarTr.children('td').eq(5).children('div').attr('title');
      tarDeckNo = tarTr.children('td').eq(6).children('div').attr('title');

      url = '/deck/' + tarReleaseDate + '/' + tarDeckNo + '/';
      width = 640;
      height = 600;
      winStats = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=' + width + ', height=' + height;
      target = 'deckInfo' + tarDeckNo;
      windowOpen url, target, width, height, null
