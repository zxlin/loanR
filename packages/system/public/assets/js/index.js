var is_lender = false;
var is_borrower = false;

var login = function() {
  $.post('/login', {
    email : $('#login-email').val(),
    password : $('#login-password').val()
  }).done(function(data) {
    $('#content').transition({
      animation: 'fly down', 
      duration: '1000ms',
      onComplete: function() {
        $('body').transition({
          animation: 'fade',
          onComplete: function() {
            window.location = data.redirect;
          }
        });
      }
    });
  }).fail(function(data) {
    $('#content').transition({
      animation: 'shake',
      duration: '500ms',
      onStart: function() {
        $('#credential-warning').fadeIn(500);
      }
    }); 
  });
};

socket.on('createAccount', function(stat) {
  if (stat === true) {
    $('#login-email').val($('#registration-email').val());
    $('#login-password').val($('#registration-password').val());
    login();
  } else {
    alert('Account creation failed');
  }
});

$(document).ready(function(){
  //fade in body
  $('body').css('display', 'none');
  $('body').fadeIn(1000);
  //Buttons
  $('#login-register-btn').on('click', function(){
    $('#registration-modal')
      .modal('show')
    ;
  });
  // hide password warning
  $('#credential-warning').hide();
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
    } else if (is_lender === is_borrower) {
      alert('Select an account type');
    } else {
      socket.emit('createAccount',{
        name : name,
        accnumber : account,
        email : email,
        user_role : (is_lender) ? 'Lender' : 'Borrower',
        password : pass1
      });
    }
  });

  $('#login-btn').on('click', login);

  //Key Press
  $('#login-email').on('keyup', function(e) {
    if (e.keyCode === 13 ) {
      login();
    }
  });

  $('#login-password').on('keyup', function(e) {
    if (e.keyCode === 13) {
      login();
    }
  });
});
