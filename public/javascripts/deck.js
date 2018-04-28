var GetData, createDeckInfoTable, downloadDeckData, editState, entryDeck, getData, initResolver, marker, toggleEdit;

marker = {
  lnd: 'Lands',
  cre: 'Creatures',
  spl: 'Spells',
  sb: 'Sideboard'
};

GetData = function() {
  var self;
  self = {};
  self.requestInfo = {
    url: window.location.origin + '/get-data/card',
    releaseDate: '',
    reqCard: []
  };
  if (/\d{8,}/.test(location.pathname.split('/')[location.pathname.split('/').indexOf('deck') + 1])) {
    self.requestInfo.releaseDate = location.pathname.split('/')[location.pathname.split('/').indexOf('deck') + 1];
  } else {
    self.requestInfo.releaseDate = latestReleaseDate;
  }
  self.responseInfo = {
    deckNo: 0,
    deckName: '',
    uploader: '',
    deck: {
      comment: '',
      cardInfo: []
    }
  };
  self.jqXHRList = [];
  self.getCardInfo = function(callback) {
    var i, jqXHRList, k, len, ref, reqCardInfo;
    jqXHRList = [];
    if (self.requestInfo.reqCard != null) {
      console.dir(self.requestInfo.reqCard);
      ref = self.requestInfo.reqCard;
      for (i = k = 0, len = ref.length; k < len; i = ++k) {
        reqCardInfo = ref[i];
        jqXHRList.push($.ajax({
          url: self.requestInfo.url + '/' + self.requestInfo.releaseDate + '/' + reqCardInfo.expansion + '/' + encodeURI(reqCardInfo.cardName.eng) + '/',
          type: 'POST',
          dataType: 'json',
          timeout: 15000
        }));
      }
      return $.when.apply($, jqXHRList).done(function() {
        var j, jqXHRResultList, l, len1, resVal, statuses;
        statuses = [];
        jqXHRResultList = [];
        self.responseInfo.deck.cardInfo = [];
        for (j = l = 0, len1 = arguments.length; l < len1; j = ++l) {
          resVal = arguments[j];
          self.responseInfo.deck.cardInfo.push(resVal[0]);
          statuses.push(resVal[1]);
          jqXHRResultList.push(resVal[3]);
        }
        return callback(self.requestInfo, self.responseInfo);
      });
    } else {
      return callback();
    }
  };
  return self;
};

getData = new GetData;

initResolver = function(callback) {
  return $.ajax({
    url: '/get-data' + location.pathname,
    type: 'POST',
    dataType: 'json',
    data: {
      reqCard: []
    }
  }).done(function(resData) {
    console.log('initResolver success');
    console.log(resData);
    if (!getData.responseInfo.deckNo) {
      getData.responseInfo.deckNo = resData.deckNo;
      getData.responseInfo.deck = resData.deck;
    }
    createDeckInfoTable({
      reqCard: getData.responseInfo.deck.cardInfo
    }, resData);
    return callback();
  }).fail(function(resData) {
    return alert('successResolver_ng!');
  });
};

toggleEdit = function() {
  var editFlg;
  editFlg = Boolean($('tfoot tr.none-disp').length);
  if (editFlg) {
    $('tfoot input[type=text], tfoot textarea').attr('readonly', false).removeClass('readOnly');
    return $('.edit-line').removeClass("none-disp");
  } else {
    $('tfoot input[type=text], tfoot textarea').attr('readonly', true).addClass('readOnly');
    return $('.edit-line').addClass("none-disp");
  }
};

editState = function() {
  var delFlg, entryFlg;
  entryFlg = Boolean(!getData.responseInfo.deckNo);
  delFlg = Boolean(getData.responseInfo.delFlg);
  if (delFlg) {
    $('tfoot input[type=text], tfoot textarea').attr('readonly', true).addClass('readOnly');
    $('.edit-line').addClass("none-disp");
    $('.upload').addClass("none-disp");
    $('.download').addClass("none-disp");
    return $('.delete').addClass("none-disp");
  } else if (entryFlg) {
    $('tfoot input[type=text], tfoot textarea').attr('readonly', false).removeClass('readOnly');
    $('.edit-line').removeClass("none-disp");
    $('.upload').removeClass("none-disp");
    $('.download').addClass("none-disp");
    return $('.delete').addClass("none-disp");
  } else {
    $('tfoot input[type=text], tfoot textarea').attr('readonly', true).addClass('readOnly');
    $('.edit-line').addClass("none-disp");
    $('.upload').addClass("none-disp");
    return $('.download').removeClass("none-disp");
  }
};

downloadDeckData = function() {
  return $.ajax({
    url: '/get-data/deck/download',
    type: 'POST',
    dataType: 'json',
    data: {
      releaseDate: getData.requestInfo.releaseDate,
      deckNo: getData.responseInfo.deckNo
    }
  }).done(function(resData) {
    var a, blob, blobURL, url;
    blob = new Blob([resData.mwsDeckData]);
    url = window.URL || window.webkitURL;
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, resData.deckName);
    } else {
      blobURL = url.createObjectURL(blob);
      a = document.createElement('a');
      a.download = resData.deckName;
      a.href = blobURL;
      a.click();
    }
    return console.log('downloadDeckData success');
  }).fail(function(resData) {
    return alert('nanka dl dekinyo!!');
  });
};

entryDeck = function(responseInfo) {
  if (responseInfo.deck != null) {
    return $.ajax({
      url: '/put-data/deck/entry',
      type: 'POST',
      dataType: 'json',
      data: {
        releaseDate: getData.requestInfo.releaseDate,
        deckNo: responseInfo.deckNo || location.pathname.split(/\//).filter(Boolean).pop(),
        deckName: $('#deckName').val() || responseInfo.deckName,
        uploader: $('#uploader').val() || responseInfo.uploader,
        editKey: $('#editKey').val(),
        delFlg: $('#delFlg:checked').val(),
        deck: [
          {
            comment: $('#comment').val() || responseInfo.deck.comment,
            cardInfo: responseInfo.deck.cardInfo
          }
        ]
      }
    }).done(function(data) {
      var base, base1, ref, ref1;
      if (data.result === 'success') {
        (base = getData.responseInfo).deckNo || (base.deckNo = data.deckNo);
        (base1 = getData.responseInfo).delFlg || (base1.delFlg = data.delFlg);
        $('#header_deckName').text($('#deckName').val() || responseInfo.deckName);
        $('#header_uploader').text($('#uploader').val() || responseInfo.uploader);
        editState();
        if ((ref = window.opener) != null) {
          if ((ref1 = ref.w2ui['deckList']) != null) {
            ref1.reset();
          }
        }
        return alert(data.message);
      } else {
        return alert(data.message);
      }
    }).fail(function(data) {
      return alert('ng!');
    });
  }
};

(function() {
  if (/\/deck\/\d{8}\/\d{5,}\//.test(location.pathname)) {
    return initResolver(editState);
  } else if (/\/deck\/entry/.test(location.pathname)) {
    $('#header_deckName').text('');
    $('#deckName').val('');
    $('#header_uploader').html('');
    $('#uploader').val('名も無きプレインズウォーカー');
    $('#comment').text('');
    return editState();
  }
})();

$(document).on('click', '#upload', function() {
  if ($('#editKey').val()) {
    return entryDeck(getData.responseInfo);
  } else {
    return alert('Edit Keyは必須です。');
  }
}).on('click', 'input#edit', function() {
  return toggleEdit();
}).on('click', 'input#download', function() {
  return downloadDeckData();
}).on('click', 'a.cardlink', function(e) {
  var height, url, width;
  e.preventDefault();
  width = 640;
  height = 480;
  url = e.target.href;
  return windowOpen(url, url, width, height, {});
});

(function() {
  return window.addEventListener('DOMContentLoaded', function() {
    var error, error1;
    if (document.getElementById('file') != null) {
      try {
        return document.querySelector('#file').addEventListener('change', function(e) {
          var error, error1, inputFile, reader;
          if (window.File != null) {
            inputFile = document.querySelector('#file').files[0];
            reader = new FileReader();
            reader.addEventListener('load', function(e) {
              var base, cardInfo, cardText, codes, elem, encoding, i, j, k, key, l, len, len1, lineData, localCardInfo, localDeckData, mwsSplit, ref, ref1, ref2, spliter, table, tbody, unicodeString, val, value;
              localDeckData = {
                deckName: '',
                cardInfo: []
              };
              table;
              codes = new Uint8Array(e.target.result);
              encoding = Encoding.detect(codes);
              unicodeString = Encoding.convert(codes, {
                to: 'unicode',
                from: encoding,
                type: 'string'
              });
              spliter = unicodeString.split('//');
              mwsSplit = {};
              for (i = k = 0, len = spliter.length; k < len; i = ++k) {
                cardText = spliter[i];
                cardText = cardText.replace(/(^\s+)|(\s+$)|(SB: )/g, '');
                for (key in marker) {
                  value = marker[key];
                  if (cardText.lastIndexOf(value, 0) === 0) {
                    mwsSplit[value] = cardText.split(/\r\n|\r|\n/);
                    ref = mwsSplit[value].slice(1, mwsSplit[value].length);
                    for (j = l = 0, len1 = ref.length; l < len1; j = ++l) {
                      val = ref[j];
                      lineData;
                      cardInfo = {
                        expansion: '',
                        cardName: {
                          jpn: '',
                          eng: ''
                        },
                        count: 0,
                        category: ''
                      };
                      lineData = mwsSplit[value][j + 1].split(/\[|\]/);
                      cardInfo.count = Number(lineData[0].replace(/(^\s+)|(\s+$)/g, ''));
                      cardInfo.expansion = lineData[1].replace(/(^\s+)|(\s+$)/g, '');
                      cardInfo.cardName.eng = lineData[2].replace(/(^\s+)|(\s+$)/g, '');
                      cardInfo.category = value;
                      localDeckData.cardInfo.push(cardInfo);
                    }
                  }
                }
              }
              localDeckData.deckName = inputFile.name.match(/(.*)(?:\.([^.]+$))/)[1];
              console.dir(localDeckData);
              (base = document.getElementById('deckName')).value || (base.value = localDeckData.deckName);
              table = document.getElementById('test_table');
              tbody = document.getElementById('deckInfo_tbody');
              for (key in marker) {
                value = marker[key];
                elem = document.getElementById(value.toLowerCase());
                while (elem.childNodes.length - 1) {
                  elem.removeChild(elem.lastChild);
                }
              }
              if (((ref1 = getData.requestInfo) != null ? ref1.reqCard : void 0) != null) {
                getData.requestInfo.reqCard = [];
              }
              ref2 = localDeckData.cardInfo;
              for (i in ref2) {
                localCardInfo = ref2[i];
                getData.requestInfo.reqCard.push(localCardInfo);
              }
              return getData.getCardInfo(createDeckInfoTable);
            }, true);
            try {
              return reader.readAsArrayBuffer(inputFile);
            } catch (error1) {
              error = error1;
              return console.log(error);
            }
          }
        }, true);
      } catch (error1) {
        error = error1;
        return console.log(error);
      }
    }
  });
})();

createDeckInfoTable = function(reqData, resData) {
  var base, base1, base2, base3, base4, cardInfoDiv, category, count, i, innerHtmlObj, k, key, len, pastFlg, ref, ref1, reqDeckCardData, resCardInfo, resDeckCardData, url, value;
  console.log('start createDeckInfoTable');
  console.dir(reqData);
  innerHtmlObj = {
    Lands: '',
    Creatures: '',
    Spells: '',
    Sideboard: '',
    LandsCount: 0,
    CreaturesCount: 0,
    SpellsCount: 0,
    SideboardCount: 0
  };
  reqDeckCardData = reqData.reqCard;
  resDeckCardData = resData.deck.cardInfo;
  for (i = k = 0, len = resDeckCardData.length; k < len; i = ++k) {
    resCardInfo = resDeckCardData[i];
    category = resCardInfo.category || reqDeckCardData[i].category;
    count = resCardInfo.count || reqDeckCardData[i].count;
    if (!resCardInfo.error) {
      url = "http://" + location.host + "/card/" + getData.requestInfo.releaseDate + "/" + resCardInfo.expansion + "/" + resCardInfo.cardName.jpn + "/";
      innerHtmlObj[category] += '<span>';
      innerHtmlObj[category] += ('\u00a0' + count).slice(-2);
      innerHtmlObj[category] += ':';
      innerHtmlObj[category] += "《<a class='cardlink' target='_blank' href='" + url + "'>";
      innerHtmlObj[category] += resCardInfo.cardName.jpn;
      innerHtmlObj[category] += '</a>》</span><br>';
      innerHtmlObj[category + 'Count'] += count;
      resCardInfo.category = category;
      resCardInfo.count = count;
    } else {
      alert(((ref = reqDeckCardData[i]) != null ? (ref1 = ref.cardName) != null ? ref1.eng : void 0 : void 0) + ':これがサーバーから情報ひけずにエラーが出てる');
    }
  }
  for (key in marker) {
    value = marker[key];
    cardInfoDiv = document.getElementById(value.toLowerCase());
    innerHtmlObj[value] += '<HR>';
    innerHtmlObj[value] += '<span class="cardtotal">-';
    innerHtmlObj[value] += [value];
    innerHtmlObj[value] += "（" + innerHtmlObj[value + 'Count'] + "）";
    innerHtmlObj[value] += '-</span><BR>';
    cardInfoDiv.innerHTML = innerHtmlObj[value];
  }
  (base = document.getElementById('header_deckName')).innerText || (base.innerText = resData.deckName);
  (base1 = document.getElementById('deckName')).value || (base1.value = resData.deckName);
  (base2 = document.getElementById('header_uploader')).innerText || (base2.innerText = resData.uploader);
  (base3 = document.getElementById('uploader')).value || (base3.value = resData.uploader);
  (base4 = document.getElementById('comment')).value || (base4.value = resData.deck.comment);
  pastFlg = Boolean(getData.requestInfo.releaseDate < latestReleaseDate);
  if (pastFlg) {
    $('#download-messeage').text('最新セットのデッキではありません。').addClass('warning');
    $('#upload-messeage').text('カード構成の編集はできません。').addClass('warning');
    return $('#file').css('display', 'none');
  }
};

(function() {
  w2utils.settings.dataType = 'JSON';
  return $('#deckList').w2grid({
    name: 'deckList',
    url: '/deck/get-list',
    method: 'POST',
    autoLoad: true,
    markSearch: false,
    header: 'Master',
    show: {
      toolbar: true,
      toolbarReload: false,
      toolbarColumns: false,
      toolbarSearch: false,
      toolbarAdd: false,
      toolbarDelete: false,
      toolbarSave: false,
      footer: true
    },
    columns: [
      {
        field: 'color',
        caption: 'Color',
        size: '45px',
        sortable: false
      }, {
        field: 'deckName',
        caption: 'Deck Name',
        size: '197px',
        sortable: false
      }, {
        field: 'uploader',
        caption: 'Uploader',
        size: '135px',
        sortable: false
      }, {
        field: 'firstEntry',
        caption: 'First Entry',
        size: '112px'
      }, {
        field: 'lastUpdated',
        caption: 'Last Updated',
        size: '112px'
      }, {
        field: 'releaseDate'
      }, {
        field: 'deckNo'
      }
    ],
    toolbar: {
      items: [
        {
          type: 'button',
          id: 'deck-entry',
          caption: 'Entry Deck',
          onClick: function() {
            var height, target, url, width, winStats;
            url = '/deck/entry';
            width = 640;
            height = 600;
            winStats = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=' + width + ', height=' + height;
            target = 'deckInfoEntry';
            return windowOpen(url, target, width, height, null);
          }
        }, {
          type: 'break'
        }, {
          type: 'spacer'
        }, {
          type: 'break'
        }, {
          type: 'button',
          id: 'help-btn',
          caption: 'Help',
          onClick: function() {
            return w2popup.open({
              title: 'Help',
              width: 400,
              height: 350,
              body: "<div class=\"help\">\n\n  <H2>詳細表示</H2>\n  <div>\n    検索結果をダブルクリックすると、デッキ詳細ウィンドウが開きます。\n  </div>\n\n  <H2>登録</H2>\n  <div>\n    明細枠左上の方にある[Entry Deck]ボタンからデッキ登録できます。<br>\n    Magic Workstation形式のデッキファイルしか登録できません。ファイルチェックしてないのであんま変なファイルあげようとすると何が起こるかわかりません。<br>\n    最新一括のデッキしか登録できません。正確には、最新一括にカード名が存在するデッキしか登録できません。\n  </div>\n\n  <H2>更新</H2>\n  <div>\n    デッキ詳細ウィンドウから[Edit]ボタンでデッキのUploadし直しやコメント等の更新ができます。登録時に設定した[Edit Key]が必須です。<br>\n    最新一括のデッキではない場合、カード構成の更新はできません。デッキ名などの変更や削除は可能です。\n  </div>\n\n  <H2>削除</H2>\n  <div>\n    登録時に設定した[Edit Key]を入力後、[Delete]にチェック入れて[Upload]ボタンを押してください。\n  </div>\n\n  <H2>その他</H2>\n  <div>\n    不具合、未実装、仕様が入り混じってるので適当にどうぞ。<BR>\n  </div>\n\n</div>"
            });
          }
        }, {
          type: 'html',
          id: 'right-spacer',
          html: '<div class="" style="margin-right:5px;"></div>'
        }, {
          type: 'spacer'
        }
      ]
    },
    onDblClick: function(event) {
      var height, tarDeckNo, tarReleaseDate, tarTr, target, url, width, winStats;
      tarTr = $('#grid_deckList_rec_' + event.recid);
      tarReleaseDate = tarTr.children('td').eq(5).children('div').attr('title');
      tarDeckNo = tarTr.children('td').eq(6).children('div').attr('title');
      url = '/deck/' + tarReleaseDate + '/' + tarDeckNo + '/';
      width = 640;
      height = 600;
      winStats = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=' + width + ', height=' + height;
      target = 'deckInfo' + tarDeckNo;
      return windowOpen(url, target, width, height, null);
    }
  });
})();
