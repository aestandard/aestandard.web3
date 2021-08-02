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

Original Network: Polygon (Matic)

The NODE Airdrop Script for the AES token presale.

**/

const mysql = require('mysql');
const ethers = require('ethers');

const AES_Addr = "0x5ac3ceee2c3e6790cadd6707deb2e87ea83b0631";
const TokenAbi = [
  "function transfer(address to, uint256 amount)",
  "function balanceOf(address) view returns (uint256)"
];

const provider = new ethers.ethers.getDefaultProvider("[REDACTED]");
const signer = new ethers.Wallet("[REDACTED]", provider);

var aesTokenContract = new ethers.Contract(AES_Addr, TokenAbi, signer);

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'aes'
});

function addTenPercent(num){
  return num + ((num / 100) * 11);
}

con.query("SELECT * FROM presale WHERE sent = 0 ORDER BY `id` ASC", function (error, results, fields) {
  if (error) throw error;
  (async () => {
    for await (const item of results){
      var a = addTenPercent(item.aesAmount).toFixed(2);
      var u = item.address;
      console.log("Sending " + a + " to addr " + u);
      let amount = ethers.utils.parseUnits(a, 9);
      let tx = await aesTokenContract.transfer(u, amount);
      await tx.wait().then(r => {
        let txHash = r.transactionHash;
        let time = Math.floor(Date.now() / 1000);
        console.log(txHash + " - Transaction done, shortly moving on!")
        var sql = "UPDATE `presale` SET `sent` = '1', `sent_time` = '" + time + "', `sent_tx` = '" + txHash + "' WHERE `address` = '" + u + "' AND `aesAmount` = '" + item.aesAmount + "'";
        con.query(sql, function (error, results, fields) {
        if (error) throw error;
        });
      });
      console.log("Moving on to the next");
    }
  })();
  console.log("Script finished")
});
