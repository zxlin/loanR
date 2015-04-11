$(document).ready(function(){
  $('#login-register-btn').on('click', function(){
    console.log('clicking');
    $('#registration-modal')
      .modal('show')
    ;
  });

});
