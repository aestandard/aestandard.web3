/**
         _                   _           _
        / /\                /\ \        / /\
       / /  \              /  \ \      / /  \
      / / /\ \            / /\ \ \    / / /\ \__
     / / /\ \ \          / / /\ \_\  / / /\ \___\
    / / /  \ \ \        / /_/_ \/_/  \ \ \ \/___/
   / / /___/ /\ \      / /____/\      \ \ \
  / / /_____/ /\ \    / /\____\/  _    \ \ \
 / /_________/\ \ \  / / /______ /_/\__/ / /
/ / /_       __\ \_\/ / /_______\\ \/___/ /
\_\___\     /____/_/\/__________/ \_____\/

Advance Encryption Standard Finance.

Website:aestandard.finance
Email:team@aestandard.finance
Bug Bounty:team@aestandard.finance

License: MIT

Original Network: Polygon (Matic)

The NODE script handling presale transactions in real-time. ran on our web servers.

**/

const express = require('express');
const mysql = require('mysql');
const ethers = require('ethers');
const https = require('https');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
var privateKey = fs.readFileSync( 'aes.key' );
var certificate = fs.readFileSync( 'aes.crt' );
const app = express();

const TokenAbi = [
  "function transfer(address to, uint256 amount)",
  "function balanceOf(address) view returns (uint256)"
];

const POOL_Addr = "0x25a31Fc776D9c7aF727625D9a83886c1be14fa2C";


const provider = new ethers.ethers.getDefaultProvider("[REDACTED]");
const signer = new ethers.Wallet("[REDACTED]", provider);


var corsOptions = { origin: ['https://aestandard.finance'], optionsSuccessStatus: 200  }

app.use(bodyParser.json());
app.use(cors(corsOptions));

const con = mysql.createConnection({
  host: 'localhost',
  user: '[REDACTED]_aes',
  password: '[REDACTED]',
  database: '[REDACTED]'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

const isTransactionMined = async(transactionHash) => {
    const txReceipt = await provider.getTransactionReceipt(transactionHash);
    if (txReceipt && txReceipt.blockNumber) {
        return txReceipt;
    }
}

app.post("/reserve", (req, res) => {
  const txHash = req.body.txReceipt.transactionHash;
  const fromAddr = req.body.txReceipt.from;
  const toAddr = req.body.txReceipt.to;
  const transactionAmount = ethers.utils.formatEther(req.body.tx.value);
  if(isTransactionMined(txHash)){
    console.log("Incoming transaction is mined");
    (async () => {
        if(toAddr.toString().toLowerCase() == POOL_Addr.toLowerCase()){
            var aes = transactionAmount / 0.4;
            console.log("Reserving " + aes + " AES (" + transactionAmount + " MATIC) to addr.");
            var time = Math.floor(Date.now() / 1000);
            con.query("INSERT INTO `presale` (address, aesAmount, time, sent_tx, presale_tx) VALUES ('" + fromAddr + "'," + aes + ", " + time + ", '0x', '" + txHash + "')");
            res.send(["Success", aes + " AES has been reserved for your address"]);
        }else{
            res.send(["Error", "Transaction Error, please contact support."]);
        }
    })();
  }else{
    console.log("Incoming transaction was not mined!");
  }
});


https.createServer({ key: privateKey, cert: certificate }, app).listen(3000);
