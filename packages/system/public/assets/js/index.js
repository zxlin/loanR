var is_lender = false;
var is_borrower = false;

$(document).ready(function(){
  $('#login-register-btn').on('click', function(){
    $('#registration-modal')
      .modal('show')
    ;
  });
  $('#main-lender-btn').on('click', function(){
    is_lender = true;
    is_borrower = false;
    $('#main-lender-btn').addClass('red');
    $('#main-borrower-btn').removeClass('blue');
  });
  $('#main-borrower-btn').on('click', function(){
    is_borrower = true;
    is_lender = false;
    $('#main-borrower-btn').addClass('blue')
    $('#main-lender-btn').removeClass('red');
  });
  $('#registration-btn').on('click', function() {
    var name = $('#registration-first-name').val();
    var account = $('#registration-account').val();
    var email = $('#registration-email').val();
    var pass1 = $('#registration-password').val();
    var pass2 = $('#registration-confirm-password').val();

    if (pass1 !== pass2) {
      alert('Passwords do not match');
    } else {
      socket.emit('createAccount', {
        name : name,
        accnumber : account,
        email : email,
        user_role : is_lender ? 'Lender' : 'Borrower',
        password : pass1
      });
    }
  });
  $('#login-btn').on('click', function() {
    $.post('/login', {
      email : $('#login-email').val(),
      password : $('#login-password').val()
    }).done(function(data) {
      window.location = data.redirect;
    }).fail(function(data) {
      alert('Username and passwords do not match.');
    });
  });
});
