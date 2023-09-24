# Crosschain API System with Polkadot and EVM Chain leveraging Phala Network

This project involves writing a script that utilizes a crosschain API system between Polkadot and any EVM chain, leveraging the Phala Network. This allows us to call any existing API and use it on-chain. The project is part of a hackathon focusing on YouTube usage. The idea is to have users interact in a livestream to incentivize users to share out the stream to get more views, and then verifying trustlessly calling the API on-chain.

## How it Works

We create a TypeScript function, referred to as a "phat function", that allows us to leverage the Polkadot network computing power to bring the API call on-chain. We build the API call leveraging Phala Network pink HTTP request. The response will be returned to a set smart contract specified by our RPC settings, in this case, Scroll Network. Once the message is received, it will automatically transact to execute the function on-chain according to the response.

### Use Case Example

In this example, we are taking bets for different ranges of how many views the video would get. Players that choose the right range win the pot when the API is called.


1. **Contract Address:**
   - [0xFefDadb1c553a2d19ED43F6Aab0C7251470db1BA](https://sepolia-blockscout.scroll.io/address/0xFefDadb1c553a2d19ED43F6Aab0C7251470db1BA/transactions#address-tabs)

2. **Relayer:**
   - [0x5bc77AfbDf5335D21101ab47Bcb95b940097e596](https://sepolia-blockscout.scroll.io/address/0x5bc77AfbDf5335D21101ab47Bcb95b940097e596)

3. **Phat Function Polkadot:**
   - [0x7610d151dc4f428dc155c87fdcb476337f34d7d0bf2923efe8f2db3d579e6a5e/0](https://bricks-poc5.phala.network/workflows/0x7610d151dc4f428dc155c87fdcb476337f34d7d0bf2923efe8f2db3d579e6a5e/0)
   - *Note: Needs a wallet signer. Image included in sub.*
