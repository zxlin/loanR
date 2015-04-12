$(document).ready(function(){
  $('#content-box').children().hide();
  $('#content-create').show();

  $('#side').children().children().on('click', function(){
    $('#side').children().children().removeClass('active');
    $(this).addClass('active');
    $('#content-box').children().hide();
    $('#'+$(this).data('target')).show();
    
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
    socket.emit('loadPosts', 'Lender');
  });

  socket.on('loadPosts', function(posts) {
    var length = posts.length;
    var x = 0;
    while (x < length) {
      var post = posts[x];

      var target = $('#content-all');

      var elem = $('<div>')
        .addClass('ui card offer-card')
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
