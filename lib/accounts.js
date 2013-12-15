var Payment = function(buyer, sum, recipients, comment) {
  this.buyer = buyer;
  this.sum = sum;
  this.recipients = recipients;
  this.comment = comment;
};

Payment.prototype.toDebts = function() {
  var self = this;
  return this.recipients.map(function(recipient) {
    return new Debt(recipient, self.buyer, self.sum/self.recipients.length);
  });
};


var Debt = function(source, target, sum) {
  this.source = source;
  this.target = target;
  this.sum = sum;
};

// graph
/// vertex: Person
var Person = function(name) {
  this.name = name;
  this.debts = {}; // [target.name] = PersonDebt
};
Person.prototype.getDebt = function(targetPerson) {
  return this.debts[targetPerson.name] || (this.debts[targetPerson.name] = new PersonDebt(targetPerson));
};

/// edge: PersonDebt
var PersonDebt = function(target, sum) {
  this.target = target; // Person
  this.sum = sum || 0;
};


var Account = function(name, payments) {
  this.name = name;
  this.payments = payments || [];

  // person debt graph
  this._persons = {}; // [person.name] = Person

  var self = this;
  this.payments.forEach(function(payment) {
    self.addPayment(payment);
  });
};

Account.prototype.getPerson = function(name) {
  return this._persons[name] || (this._persons[name] = new Person(name));
};


Account.prototype.addPayment = function(payment) {
  var self = this;
  var debts = payment.toDebts();
  debts.forEach(function(debt) {
    self.addDebt(debt);
  });
};

Account.prototype.addDebt = function(debt) {
  var sourcePerson = this.getPerson(debt.source);
  var targetPerson = this.getPerson(debt.target);

  var personDebt = sourcePerson.getDebt(targetPerson);

  personDebt.sum += debt.sum;
};

Account.prototype.reduce = function() {
};

Account.prototype.dumpDebts = function() {
  var self = this;
  var dump = [];
  Object.keys(this._persons).forEach(function(sourceName) {
    var sourcePerson = self._persons[sourceName];
    Object.keys(sourcePerson.debts).forEach(function(targetName) {
      dump.push(new Debt(sourceName, targetName, sourcePerson.debts[targetName].sum));
    });
  });
  return dump;
};



module.exports.Payment = Payment;
module.exports.Account = Account;
module.exports.Debt = Debt;
