#!/usr/bin/env node

var Accounts = require('./lib/accounts');


var payments = [
  new Accounts.Payment('A', 10, ['A', 'B']),
  new Accounts.Payment('B', 2, ['A', 'B'])
];

var account = new Accounts.Account('test account', payments);



account.reduce();

console.log(account.dumpDebts());

