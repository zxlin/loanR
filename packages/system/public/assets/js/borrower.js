$(document).ready(function(){
  $('#content-box').children().hide();
  $('#content-create').show();

  $('#side').children().children().on('click', function(){
    $('#side').children().children().removeClass('active');
    $(this).addClass('active');
    $('#content-box').children().hide();
    $('#'+$(this).data('target')).show();
    
  });

});
