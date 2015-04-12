$(document).ready(function() {
  //Handles content swap
  $('#content-box').children().hide();
  $('#content-create').show();

  $('#side').children().children().on('click', function(){
    $('#side').children().children().removeClass('active');
    $(this).addClass('active');
    $('#content-box').children().hide();
    $('#'+$(this).data('target')).show();
  });

  //Handle search
  $('#search-wish-btn').on('click', function() {
    var amount = parseInt($('#search-wish-total').val());
    var interest = parseInt($('#search-wish-interest').val()) / 100;
    var monthly = parseInt($('#search-wish-monthly').val());
//    socket.emit('query', 
  });

  $('#create-loan-btn').on('click', function() {
    var amount = parseInt($('#create-loan-total').val());
    var interest = parseInt($('#create-loan-interest').val()) / 100;
    var monthly = parseInt($('#create-loan-monthly').val());
    var rating = parseInt($('#create-loan-rating').val());

    socket.emit('createPost', {
      user : user,
      user_role : user_role,
      amount : amount,
      interest : interest,
      monthly_bill : monthly,
      rating : rating
    });
  });

  $('#sidemenu-all').on('click', function() {
    console.log('clicked');
    socket.emit('loadPosts', 'Borrower');
  });

  socket.on('loadPosts', function(posts) {
    console.log(posts);
  });
});
