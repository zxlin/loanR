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

    $('#create-loan-total').val('');
    $('#create-loan-interest').val('');
    $('#create-loan-monthly').val('');
    $('#create-loan-rating').val('');
  });

  $('#sidemenu-all').on('click', function() {
    socket.emit('loadPosts', 'Borrower');
  });

  socket.on('loadPosts', function(posts) {
    $('.offer-card').remove();
    var length = posts.length;
    var x = 0;
    while (x < length) {
      var post = posts[x];

      var target = $('#content-all');

      var elem = $('<div>')
        .addClass('ui card offer-card')
        .css({
          'margin-right' : '20px',
          'width' : 'calc(50% - 20px)'
        })
        .append($('<div>')
          .addClass('content')
          .append($('<div>')
            .addClass('header')
            .append($('<span>')
              .text('$' + post.amount + ' Loan Offer')
            )
            .append($('<div>')
              .addClass('meta')
              .append($('<span>')
                .text('Interest Rate ' + (post.interest * 100) + '%')
              )
            )
            .append($('<p>')
              .text((post.estimated_completion ? post.estimated_completion : Infinity) + '-month loan at $' + post.monthly_bill+ ' per month')
            )
            .append($('<div>')
              .addClass('ui blue button submit')
              .text('Take Loan')
            )
          )
        )
      ;
      target.append(elem);
      x++;
    }
  });
});
