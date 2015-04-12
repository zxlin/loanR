var populatePost = function(target, post) {
  $(target).append($('<div>')
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
  );
};

$(document).ready(function(){
  $('#content-box').children().hide();
  $('#content-create').show();

  //Toggle between views
  $('#side').children().children().on('click', function(){
    $('#side').children().children().removeClass('active');
    $(this).addClass('active');
    $('#content-box').children().hide();
    $('#'+$(this).data('target')).show();
  });

  //Create a new loan wish
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

  //Load all loan offers
  $('#sidemenu-all').on('click', function() {
    socket.emit('loadPosts', 'Lender');
  });

  //Query for loan offers
  $('#search-wish-btn').on('click', function() {
    socket.emit('query', {
      amount : parseInt($('#search-wish-total').val()),
      interest : parseInt($('#search-wish-interest').val()) / 100,
      monthly : parseInt($('#search-wish-monthly').val()),
      role : (user_role === 'Lender') ? 'Borrower' : 'Lender'
    });
  });

  //Hide search results 
  $('#sidemenu-search').on('click', function() {
    $('#content-search-result').hide();
  });

  //Populate searched loan offers
  socket.on('query', function(posts) {
    var target = $('#content-search-result').show();
    $('#content-search').hide();
    var length = posts.length;
    var x = 0;
    while (x < length) {
      var post = posts[x];
      populatePost(target, post);
      x++;
    }
  });

  //Populate all loan offers
  socket.on('loadPosts', function(posts) {
    $('.offer-card').remove();
    var target = $('#content-all');
    var length = posts.length;
    var x = 0;
    while (x < length) {
      var post = posts[x];
      populatePost(target, post);
      x++;
    }
  });
});
