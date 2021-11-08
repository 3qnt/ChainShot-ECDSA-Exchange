const express = require('express');
const app = express();
const cors = require('cors');

// Cryptography
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const SHA256 = require('crypto-js/sha256');
//Port
const port = 3042;

/*
localhost can have cross origin errors
depending on the browser you use!
*/
app.use(cors());
app.use(express.json());

// Generate address and assign default balances
const accountsBal = [];
let i = 0;
do {
    const key = ec.genKeyPair();
    const publicKey = key.getPublic().encode('hex');
    const privateKey = key.getPrivate().toString(16);
    accountsBal[publicKey] = 50; // starting balance
    console.log("--------- \nAddress #" + (i+1))
    console.log("Public Key: " + publicKey + "\nPrivate Key: " + privateKey + "\nBalance: " + accountsBal[publicKey])
    i++;
} while (i < 3);

/* // Generate key pairs
const key1 = key.ec.genKeyPair();
const key2 = key.ec.genKeyPair();
const key3 = key.ec.genKeyPair();
*/

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = accountsBal[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {

  const{signature, transaction, publicKey} = req.body;
  const key = ec.keyFromPublic(publicKey, 'hex');
  const transHash = SHA256(JSON.stringify(transaction)).toString();

  if((key.verify(transHash, signature)) && ((accountsBal[publicKey] - transaction.amount) >= 0)) {
    console.log(req.body);
    accountsBal[publicKey] -= transaction.amount;
    accountsBal[transaction.recipient] = accountsBal[transaction.recipient] + +transaction.amount;
    res.send({ balance: accountsBal[publicKey] });
  } else if ((accountsBal[publicKey] - transaction.amount) < 0) {
    console.log("Insufficient funds!")
  } else {
    res.sendStatus(404);
  }


});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

/*console.log("-------------" + "\nKey: " + publicKey1 + "\nBalance: " + balances.publicKey1 + "\n-------------")
console.log("Key: " + publicKey2 + "\nBalance: " + balances.publicKey2 + "\n-------------")
console.log("Key: " + publicKey3 + "\nBalance: " + balances.publicKey3 + "\n-------------")
*/
