/*  
    building a simple Blockchain in JavaScript
    application usage: transition security
    version 0.2.0
    -added reward and transactions
    Mark Schatz
*/  

const SHA256 = require('crypto-js/sha256');

//building a transaction
//
class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

//block creation
//index of the block is determined by the position in the Array
//timestamp     = time of blockcreation
//transactions  = data in the block, use cases, transaction information, currency flow etc.,build as Array
//previousHash  = contains Hash of the previous block, ensures integrity
//nounce        = random number, to check, when loop has to end
//
class Block{
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions; 
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    //calculate Hash of the current block, as identifier
    //using crypto-js for Hash calculation
    //adding proof-of-work, mining difficulty
    //
    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    //adding proof-of-work
    //difficulty = head of Hash, that has to be the same
    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }
}

//blockchain constr.
//
class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;                            //change difficulty to mine new blocks
        this.pendingTransactions = [];                  //transactions, which are stored while new block is generated 
        this.miningReward = 1;                          //reward for mining
    }

    //manually generate start block
    createGenesisBlock(){
        return new Block("01.07.2018", "Genesis Block", "0");
    }

    //get the value of the last blockchain
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    //store walletadress off miner, send reward for sucessfull mining
    //
    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions);    //ToDo: need algorithm to store efficient pending Transactions, to new block, better shedule
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined! ');
        this.chain.push(block);

        //give out Reward, and reset pendingTransactions
        this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];
    }

    //recieve Transaction and add it to pending
    //
    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    //calculate balance on your wallet 
    //
    getBalanceOfAddress(address){
        let balance = 0;

        //loop all blocks in our blockchain, to track our transactions
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }
                
                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    /*
    //add a new block to the chain, without reward
    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;     //security measure, to locate latest block
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);                              
    }
    */

    //check if chain is valid or interrupt in chain
    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock= this.chain[i-1];

            //check if hash is valid
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            //check if block points to correct previous one
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }

        return true;
    }
}

//testcase adding the currency simpleCoin
//
let simpleCoin = new Blockchain();

//testing Transactions
//adress1,2 would be public key of wallet
//
simpleCoin.createTransaction(new Transaction('address1', 'address2',100));
simpleCoin.createTransaction(new Transaction('address2', 'address1',50));

console.log('\n Starting the miner... ');
simpleCoin.minePendingTransactions('mustermann-address');

console.log('\nBalance of Mustermann is', simpleCoin.getBalanceOfAddress('mustermann-address'));

console.log('\n Starting the miner... ');
simpleCoin.minePendingTransactions('mustermann-address');

console.log('\nBalance of Mustermann is', simpleCoin.getBalanceOfAddress('mustermann-address'));

/*
//testing miner

console.log('Mining Block 1 ... ');
simpleCoin.addBlock(new Block(1, "02.07.2018", {amount: 5 }));

console.log('Mining Block 2 ... ');
simpleCoin.addBlock(new Block(2, "03.07.2018", {amount: 4 }));
*/

/*
//is Blockchain valid case
console.log('is Blockchain valid? ' + simpleCoin.isChainValid());

//testcase change hash
simpleCoin.chain[1].data = {amount : 1000}; 
simpleCoin.chain[1].hash = simpleCoin.chain[1].calculateHash(); 

//testrun
//console.log(JSON.stringify(simpleCoin, null, 4));
*/