var Payment = function (buyer, sum, recipients, comment) {
  this.buyer = buyer;
  this.sum = sum;
  this.recipients = recipients;
  this.comment = comment;
};

var Account = function(name) {
  this.name = name;
};

Account.prototype.reduce = function() {
};


  
module.exports.Payment = Payment;

