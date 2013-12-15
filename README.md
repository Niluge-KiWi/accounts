Accounts
========

Debts & Payments graph reduction.

## Installation

```bash
$ npm install
```

## Example

Input payments.json:
```json
[
  {
    "buyer": "A",
    "sum": 10,
    "recipients": [
      "A",
      "B"
    ],
    "comment": "payment 1"
  },
  {
    "buyer": "B",
    "sum": 2,
    "recipients": [
      "A",
      "B"
    ],
    "comment": "payment 2"
  }
]
```

Usage:
```bash
$ ./accounts.js -p payments1.json 
payments [ { buyer: 'A',
    sum: 10,
    recipients: [ 'A', 'B' ],
    comment: 'payment 1' },
  { buyer: 'B',
    sum: 2,
    recipients: [ 'A', 'B' ],
    comment: 'payment 2' } ]
reduced debts [ { source: 'B', target: 'A', sum: 4 } ]
```

## Licenses

Multi-licensed under [WTFPL 2.0](http://www.wtfpl.net/txt/copying/), [CC0 1.0](http://creativecommons.org/publicdomain/zero/1.0/), [MIT](http://opensource.org/licenses/MIT); choose any or any combination of these licenses.
