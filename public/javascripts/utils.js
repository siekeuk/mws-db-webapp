var popupMessage, showMessage, windowOpen;

windowOpen = function(url, target, width, height, inputObj) {
  var body, form, i, input, j, len, obj, ref, winStats;
  winStats = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=' + width + ', height=' + height;
  window.open('', target, winStats);
  form = document.createElement('form');
  form.action = url;
  form.target = target;
  form.method = 'post';
  ref = inputObj != null;
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    obj = ref[i];
    input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', obj.name);
    input.setAttribute('value', obj.value);
    form.appendChild(input);
  }
  body = document.getElementsByTagName('body')[0];
  body.appendChild(form);
  form.submit();
  return body.removeChild(form);
};

showMessage = function(message, error) {
  var ele;
  ele = $('#message');
  if (error === 'error') {
    ele.addClass(error);
  } else {
    ele.removeClass(error);
  }
  return ele.html(message);
};

popupMessage = function(message, error) {
  var mesCat;
  mesCat = error === 'error' ? 'エラー' : 'メッセージ';
  return alert(mesCat + "：\n" + message);
};
