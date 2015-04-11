var expected_time = function(amount, interest, monthly) {
  for (var t = 1; t <= 10000; t++) {
    if (Math.pow(amount * (1 + interest), t) - t * monthly <= 0) {
      return t;
    }
  }
  return Infinity;
};


//console.log(expected_time(1000000, 2.00, 1))


