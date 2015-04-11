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
});
