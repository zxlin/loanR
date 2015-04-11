var UserSchema = new Schema({
  poster: {},
  amount: {
    type: Number,
    required: true
  },
  interest: {
    type: Number,
    required: true
  },
  monthly_bill: {
    type: Number,
    required: true
  },
  estimated_completion: {
    type: Date,
    required: true
  },
  desired_rating: {
    type: Date,
    required: true
  }
});
