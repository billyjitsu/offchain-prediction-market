# Crosschain API System with Polkadot and EVM Chain leveraging Phala Network

This project involves writing a script that utilizes a crosschain API system between Polkadot and any EVM chain, leveraging the Phala Network. This allows us to call any existing API and use it on-chain. The project is part of a hackathon focusing on YouTube usage. The idea is to have users interact in a livestream to incentivize users to share out the stream to get more views, and then verifying trustlessly calling the API on-chain.

## How it Works

We create a TypeScript function, referred to as a "phat function", that allows us to leverage the Polkadot network computing power to bring the API call on-chain. We build the API call leveraging Phala Network pink HTTP request. The response will be returned to a set smart contract specified by our RPC settings, in this case, Scroll Network. Once the message is received, it will automatically transact to execute the function on-chain according to the response.

### Use Case Example

In this example, we are taking bets for different ranges of how many views the video would get. Players that choose the right range win the pot when the API is called.

## Getting Started

To get started with this project, you will need to have a basic understanding of TypeScript, Polkadot, EVM chains, and smart contracts. Further details on the implementation and usage will be provided as the project progresses.

## Contributing

Feel free to contribute to this project by submitting pull requests or raising issues. We appreciate your support and collaboration.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
