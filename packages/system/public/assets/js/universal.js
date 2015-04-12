var socket = io.connect(location.host);
toastr.options = {
  closeButton : true,
  debug : false,
  progressBar: true,
  positionClass: 'toast-bottom-left',
  onclick: null,
  showDuration: '300',
  hideDuration: '1000',
  timeOut: '10000',
  extendedTimeOut: '1000',
  showEasing: 'swing',
  hideEasing: 'linear',
  showMethod: 'fadeIn',
  hideMethod: 'fadeOut'
};

var notify = function(success, error, stat) {
  if (stat === null) {
    toastr.success(success);
  } else {
    if (stat !== false) {
      toastr.error(error + stat);
    } else {
      toastr.error(error + 'Unknown Error');
    }
  }
};

//Remove post
socket.on('removePost', function(data) {
  $('#' + data.id).remove();
  notify('A listing has been removed.', '', null);
});

//Add post
socket.on('addPost', function(data) {
  populatePost($('#content-all'), data.post);
  notify('A new listing has been added', '', null);
});

//Update money
socket.on('updateBalance', function(data) {
  if (data.user === user) {
    $('#dash-balance').text('$' + data.balance);
  }
});

//
socket.on('closedLoans', function(data) {
  var length = data.length;
  var x = 0;
  var target = $('#closed-body').empty();
  while (x < length) {
    var item = data[x];
    populateCompleteLoan(target, item);
    x++;
  }
});
