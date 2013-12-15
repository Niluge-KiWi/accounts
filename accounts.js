#!/usr/bin/env node

var fs = require('fs');

var Accounts = require('./lib/accounts');

var argv = require('optimist')
      .usage('Usage: $0 -p payments.json')
      .demand(['p'])
      .alias('p', 'payments')
      .describe('p', 'the payments file')
      .argv;


var paymentsJson = JSON.parse(fs.readFileSync(argv.payments));

var payments = [];
paymentsJson.forEach(function(p) {
  var payment = new Accounts.Payment(p.buyer, p.sum, p.recipients, p.comment);
  payments.push(payment);
});

console.log('payments', payments);

var account = new Accounts.Account('account', payments);



account.reduce();

console.log('reduced debts', account.dumpDebts());

