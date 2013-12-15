var assert = require('assert');
var _ = require('underscore');

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

  this._reduceParsed = false;
};
Person.prototype.getDebt = function(targetPerson) {
  return this.debts[targetPerson.name] || (this.debts[targetPerson.name] = new PersonDebt(this, targetPerson));
};

/// edge: PersonDebt
var PersonDebt = function(source, target, sum) {
  this.source = source; // Person
  this.target = target; // Person
  this.sum = sum || 0;

  this.source._reduceParsed = false; //TODO verify it's enough when we add Payments to an already reduced Account
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

Account.prototype._getPerson = function(name) {
  return this._persons[name] || (this._persons[name] = new Person(name));
};


Account.prototype.addPayment = function(payment) {
  var self = this;
  var debts = payment.toDebts();
  // remove self debts
  var usefulDebts = _.filter(debts, function(debt) {
    return debt.source != debt.target;
  });
  usefulDebts.forEach(function(debt) {
    self.addDebt(debt);
  });
};

Account.prototype.addDebt = function(debt) {
  var sourcePerson = this._getPerson(debt.source);
  var targetPerson = this._getPerson(debt.target);

  var personDebt = sourcePerson.getDebt(targetPerson);

  personDebt.sum += debt.sum;
};

// main algo
Account.prototype.reduce = function() {
  var self = this;
  Object.keys(this._persons).forEach(function(personName) {
    var person = self._persons[personName];
    self._reduceRecurse(person, []);
  });
};

/**
 * looks for loops in graph, and delete them
 * @param {Person} person current Person analyzed
 * @param {Array.<PersonDebt>} pastDebts (const) list of previously parsed persons & debts in the recursion
 * @returns {Array.<PersonDebt>} list of removed debts, to stop the recursion
 */
Account.prototype._reduceRecurse = function(person, pastDebts) {
  //console.log('_reduceRecurse', person, pastDebts);

  var self = this;

  var removedDebts = [];

  if (this._reduceParsed)
    return removedDebts;

  // step 1: is current person creating a loop?
  var loopDebtIndex;
  var loop = pastDebts.some(function(pastDebt, i) {
    if (person == pastDebt.source) {
      loopDebtIndex = i;
      return true;
    }
    return false;
  });

  if (loop) {
    // find the lowest debt
    var lowestDebt = pastDebts[loopDebtIndex];
    for (var i = loopDebtIndex + 1; i < pastDebts.length; i++) {
      var currentDebt = pastDebts[i];
      if (currentDebt.sum < lowestDebt.sum) {
        lowestDebt = currentDebt;
      }
    }

    //console.log('cut cycle', loopDebtIndex, lowestDebt);

    // remove the sum from the loop
    for (var j = loopDebtIndex; j < pastDebts.length; j++) {
      var currentDebt2 = pastDebts[j];
      currentDebt2.sum -= lowestDebt.sum;
      assert(currentDebt2.sum >= 0);

      if (currentDebt2.sum === 0) {
        // remove the lowest debts
        delete currentDebt2.source.debts[currentDebt2.target.name];
        removedDebts.push(currentDebt2);
      }
    }
    assert(removedDebts.length > 0, 'cycle should be break');

    return removedDebts;
  }


  // step 2: recurse
  Object.keys(person.debts).forEach(function(targetName) {
    var newDebt = person.debts[targetName];
    // recurse
    var newRemovedDebts = self._reduceRecurse(newDebt.target, pastDebts.concat(newDebt));

    // update pastDebts according to newRemovedDebts: start after the last one removed
    if (newRemovedDebts.length > 0) {
      for (var i = pastDebts.length - 1; i >= 0; i--) {
        if (newRemovedDebts.indexOf(pastDebts[i]) !== -1) {
          // found our last removed debt
          pastDebts = pastDebts.slice(i + 1); // loop search recursion now starts after the removed debt
          break;
        }
      }
      removedDebts = removedDebts.concat(newRemovedDebts); //TODO: maybe we don't need to return all the removed debts: only the one that could be useful to the parent; probably the ones that are not in the removed part of pastDebts
    }
  });

  // step 3: finish
  person._reduceRecurse = true;
  return removedDebts;
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
