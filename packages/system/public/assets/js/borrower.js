var populatePost = function(target, post) {
  if (post.role === user_role) {
    return;
  }
  $(target).append($('<div>')
    .attr('id', post._id)
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
          .data('id', post._id)
          .text('Take Loan')
          .on('click', function() {
            var post = $(this);
            socket.emit('takeLoan', {
              user : user,
              role : user_role,
              postId : post.data('id')
            });
          })
        )
      )
    )
  );
};

var populatePostTable = function(target, post) {
  $(target).append($('<tr>')
    .attr('id', post._id)
    .append($('<td>')
      .text(post.amount)
    )
    .append($('<td>')
      .text(post.monthly_bill)
    )
    .append($('<td>')
      .text(post.estimated_completion)
    )
    .append($('<td>')
      .text((post.interest * 100 + '%'))
    )
    .append($('<td>')
      .css({
        'text-align' : 'center'
      })
      .append($('<i>')
        .data('id', post._id)
        .addClass('red icon remove')
        .css({
          'cursor' : 'pointer'
        })
        .on('click', function() {
          socket.emit('deletePost', $(this).data('id'));
        })
      )
    )
  );
};

var populateLoanTable = function(target, loan) {
  var date = new Date();
  $(target).append($('<tr>')
    .attr('id', loan._id)
    .append($('<td>')
      .text('$' + loan.amount_left)
    )
    .append($('<td>')
      .text((date.getDate() < loan.pay_day) ? ((date.getMonth() + 1)+ '/' + loan.pay_day) : ((date.getMonth() + 2) + '/' + loan.pay_day))
    )
    .append($('<td>')
      .text('$' + Math.max(0, loan.monthly_fee_left_to_pay_this_month))
    )
    .append($('<td>')
      .text(loan.estimated_time_left)
    )
    .append($('<td>')
      .css({
        'text-align' : 'center'
      })
      .append($('<i>')
        .data('id', loan._id)
        .data('to_pay', Math.max(0, loan.monthly_fee_left_to_pay_this_month))
        .addClass('icon payment')
        .css({
          'cursor' : 'pointer'
        })
        .on('click', function() {
          var loan = $(this).data('id');
          var to_pay = parseInt($(this).data('to_pay'));
          $('#payment-amount').val(to_pay);
          $('#payment-modal').modal({
            closable : true,
            onApprove : function() {
              to_pay = parseInt($('#payment-amount').val());
              var have_money = to_pay <= balance;
              if (!have_money) {
                notify('', 'Could not make payment: ', 'You do not have enough funds in your account');
              } else if (to_pay <= 0) {
                notify('', 'Could not make payment: ', 'You must pay a positive amount of money');
              } else {
                socket.emit('makePayment', {
                  user : user,
                  loan : loan,
                  amount : to_pay
                });
              }
            }
          }).modal('show');
        })
      )
    )
  );
};

var populateCompleteLoan = function(target, loan) {
  $(target).append($('<tr>')
    .attr('id', loan._id)
    .append($('<td>')
      .text('$' + loan.original_amount)
    )
    .append($('<td>')
      .text((loan.interest * 100) + '%')
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

    socket.emit('createPost', {
      user : user,
      user_role : user_role,
      amount : amount,
      interest : interest,
      monthly_bill : monthly,
    });
    
    $('#create-loan-total').val('');
    $('#create-loan-interest').val('');
    $('#create-loan-monthly').val('');
  });

  //Load user's loan wishes
  $('#sidemenu-open').on('click', function() {
    socket.emit('loadUserPosts', user);
  });

  //Load all loan offers
  $('#sidemenu-all').on('click', function() {
    socket.emit('loadPosts', (user_role === 'Lender') ? 'Borrower' : 'Lender');
  });

  //Load all active loans
  $('#sidemenu-active').on('click', function() {
    socket.emit('openLoans', user);
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

  $('#sidemenu-closed').on('click', function() {
    socket.emit('closedLoans', user);
  });

  //Hide search results 
  $('#sidemenu-search').on('click', function() {
    $('#content-search-result').hide();
  });

  //Notify when post is created
  socket.on('createPost', function(data) {
    notify('Your listing was successfully created.', 'Your listing could not be created', data);
  });

  //Notify when post is deleted
  socket.on('deletePost', function(data) {
    $('#' + data.id).remove();
    notify('You successfully delisted a loan wish', 'Sorry, there was an error when attemping to delist your loan wish', data.error);
  });

  //Notify when loan payment made
  socket.on('makePayment', function(data) {

    notify('You successfully made a loan payment', 'Sorry, there was an error when attemping to make your loan payment', data.error);
    if (data.loan) {
      var target = $('#' + data.loan._id);
      if (data.loan.amount_left <= 0) {
        target.remove();
      } else {
        target.find('i').data('to_pay', Math.max(0, data.loan.monthly_fee_left_to_pay_this_month));
        target.find('td').first().text('$' + data.loan.amount_left);
        target.find('td').first().next().next().text('$' + Math.max(0, data.loan.monthly_fee_left_to_pay_this_month));
        target.find('td').first().next().next().next().text(data.loan.estimated_time_left);
      }
    }
  });

  //Notify when loan is taken
  socket.on('takeLoan', function(data) {
    $('#' + data.id).remove();
    notify('You have successfully taken a loan!', 'Sorry, there was an error when attemping to take the loan', data.error);
  });

  //Populate active loans
  socket.on('openLoans', function(loans) {
    var target = $('#contracted-body').empty();
    var length = loans.length;
    var x = 0;
    while (x < length) {
      var loan = loans[x];
      populateLoanTable(target, loan);
      x++;
    }
  });

  //Populate users offers
  socket.on('loadUserPosts', function(posts) {
    var target = $('#content-open tbody').empty();
    var length = posts.length;
    var x = 0;
    while (x < length) {
      var post = posts[x];
      populatePostTable(target, post);
      x++;
    }
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
