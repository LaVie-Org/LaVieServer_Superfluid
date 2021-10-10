require("dotenv").config();
const app = require('express')();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
var cors = require('cors');
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");

var provider = new HDWalletProvider({
    privateKeys: [process.env.pkey], 
    providerOrUrl: process.env.alchemy,
    chainId: process.env.chainId
});
const SuperfluidSDK = require("@superfluid-finance/js-sdk");

const web3 = new Web3(provider);
web3.eth.accounts.wallet.add(process.env.pkey);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


const sf = new SuperfluidSDK.Framework({
    web3: new Web3(web3),
    from: web3.eth.accounts.wallet[0].address
});

web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;

async function run() {
    //console.log(web3.eth.accounts.wallet[0]);
    const flow_rate_t2 = '11574074074074100';
    const flow_rate_t3 = '23148148148148100';

    await sf.initialize();

    async function StartFlow(address, flow_rate_ind){
        let flow_rate;
        if(flow_rate_ind == 1){
            flow_rate = flow_rate_t2;
        } else {
            flow_rate = flow_rate_t3;
        }
        try{

        let x = await sf.cfa.createFlow({
            superToken: process.env.lavxAddress,
            sender: web3.eth.accounts.wallet[0].address,
            receiver: address,
            flowRate: flow_rate // 2000 per day
        }).then((x) => x);
        return 200;
        } catch(err) {
            return 400;
        }

    }

    async function StopFlow(address){
        try {
            await sf.cfa.deleteFlow({
                superToken: process.env.lavxAddress,
                sender: web3.eth.accounts.wallet[0].address,
                receiver: address,
                by: web3.eth.accounts.wallet[0].address
            });
            return 200;
        } catch(err) {
            return 400;
        }
    }
    app.get('/', async (req, res) =>  {
        res.send("app is running . . .");
    });

    app.post('/start', async (req, res) =>  {
        let x = req.body;
        let sfRes = await StartFlow(x['address'], x['flow_type']);
        res.sendStatus(sfRes);
    });

    app.post('/end', async (req, res) =>  {
        let x = req.body;
        let sfRes = await StopFlow(x['address']);
        res.sendStatus(sfRes);
    })

    server.listen(PORT,() => {
        console.log(`Listening on port ${PORT} . . .`);
    });
}

run().catch(console.error);