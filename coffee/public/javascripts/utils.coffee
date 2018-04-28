
windowOpen = (url, target, width, height, inputObj) ->
  winStats = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=' + width + ', height=' + height;
  window.open('', target, winStats);

  # formを生成
  form = document.createElement('form');
  form.action = url;
  form.target = target;
  form.method = 'post';

  for obj,i in inputObj?
    input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', obj.name);
    input.setAttribute('value', obj.value);
    form.appendChild(input);

  # formをbodyに追加して、サブミットする　その後、formを削除
  body = document.getElementsByTagName('body')[0];
  body.appendChild(form);
  form.submit();
  body.removeChild(form);

#メッセージを表示する
#error は 'error' を渡せ！
showMessage = (message, error) ->
  ele = $('#message')
  if error is 'error' then ele.addClass(error) else ele.removeClass(error)
  ele.html(message);

#popupする
popupMessage = (message, error) ->
  mesCat = if error is 'error' then 'エラー' else 'メッセージ'
  alert """
  #{mesCat}：
  #{message}
  """
