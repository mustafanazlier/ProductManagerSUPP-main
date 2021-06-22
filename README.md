# Ethereum Supply Chain Management 

**Workflow**  
1-Seller (the smart contract's owner) creates a new product, unique qr is generated for created product.  
2-New product is stored on the blockchain with all relevant information and a unique payment address (address of a new contract that has been created for handling the payment of that product).  
3-Seller provides the consumer who wishes to purchase the item with a price and payment address.  
4-Consumer is making a payment, and the money are being sent to the required address.  
5-Payment is detected automatically by monitoring the events of a smart contract.  
6-Once the payment has been received and verified, the seller can update the product's status and inform the warehouse to ship the item to the client.  

**Truffle v5.3.9 (core: 5.3.9)  
Solidity v0.5.16 (solc-js)  
Node v10.19.0  
Web3.js v1.3.6  
React**

Dependencies:  
material-ui: npm install @material-ui/core  
react-qr-code: yarn add react-qr-code  
