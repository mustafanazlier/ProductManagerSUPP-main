// ReactJS compoments
import React, { Component } from "react";

// Ehtereum contracts
import ProductManagerContract from "./contracts/ProductManager.json";
import ProductPaymentHandlerContract from "./contracts/ProductPaymentHandler.json"
import getWeb3 from "./getWeb3";

// MaterialUI imports
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';

// Local components
import Header from "./components/Header"
import Waiting from "./components/Waiting"
import NewItem from "./components/NewItem"
import Notification from "./components/Notification"
import ProductTable from "./components/ProductTable"
import SimpleProductTable from "./components/SimpleProductTable"
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3Loaded: false,
      numberOfProducts: 0,
      productsNew: [],
      productsPaid: [],
      productsDelivered: [],
      showNotification: false,
      notificationMessage: ""
    };

    this.smartContractEventListener = this.smartContractEventListener.bind(this);
    this.getAllProductsFromContract = this.getAllProductsFromContract.bind(this);
    this.toggleNotification = this.toggleNotification.bind(this);
  }

  //state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.productManager = new this.web3.eth.Contract(
          ProductManagerContract.abi,
          ProductManagerContract.networks[this.networkId] && ProductManagerContract.networks[this.networkId].address,
      );

      // Get the ProductPaymentHanler contract instance.
      this.productPaymentHandler = new this.web3.eth.Contract(
          ProductPaymentHandlerContract.abi,
          ProductPaymentHandlerContract.networks[this.networkId] && ProductPaymentHandlerContract.networks[this.networkId].address,
      );

      this.smartContractEventListener();

      await this.getAllProductsFromContract();

      this.interval = setInterval(() => this.getAllProductsFromContract(), 5000);


      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      //this.setState({ web3, accounts, contract: instance }, this.runExample);
      this.setState({
        web3Loaded: true,
      });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
      //
    }
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  toggleNotification() {
    this.setState(state => ({
      showNotification: !state.showNotification
    }));
  }

  getAllProductsFromContract = async () => {
    /**
     * Fetches all the products stored under ProductManager smart contract.
     */

    // Getting the number of products created and stored in Productmanager smart contract
    // (from public field which represents last index as id used for products)
    await this.productManager.methods.index().call({ from: this.accounts[0] }).then((result) => {
      this.setState({
        numberOfProducts: result
      })
    });

    const productsNew = [];
    const productsPaid = [];
    const productsDelivered = [];

    const productStatuses = {
      0: 'Created',
      1: 'Paid',
      2: 'Delivered'
    }

    for (let index = 0; index < this.state.numberOfProducts; index++) {
      let product = null;

      // Reading data about probuct from smart contract
      await this.productManager.methods.products(index).call({ from: this.accounts[0] }).then((result) => {
        product = result;
      });

      let productData = {
        id: index,
        name: product.productUid,
        price: product.price,
        state: productStatuses[product.state],
        paymentAddress: product.paymentHandler
      }

      // Sorting products based on their status to the right collection
      if (product.state == 0)
        productsNew.push(productData);
      else if (product.state == 1) {
        productsPaid.push(productData);
      }
      else if (product.state == 2) {
        productsDelivered.push(productData)
      }
    }

    this.setState({
      productsNew: productsNew,
      productsPaid: productsPaid,
      productsDelivered: productsDelivered,
    });
  }

  smartContractEventListener = async () => {
    /**
     * Function that subscribes to the all the events emmited by the contract and handles them.
     */
    let self = this;

    this.productManager.events.ProductStateChanged().on("data", async function (emitedEvent) {
      // Getting the index of a product for which an event was created
      let productIndex = emitedEvent.returnValues._productIndex;

      if (productIndex < self.state.numberOfProducts) {
        // Handling only event for payments and deliveris(id of a product has to be the lesser than the last index)

        // Getting the product data
        // let product = await self.productManager.methods.products(productIndex).call({ from: self.accounts[0]});
        let products = self.state.productsNew.concat(self.state.productsPaid, self.state.productsDelivered);
        let product = null;
        products.forEach(element => {
          if (productIndex == element.id)
            product = element;
        });
        //

        let message = "";
        if (product.state == 'Created') {
          message = "Item " + product.name + " was paid!"
        }
        else {
          message = "Item " + product.name + " was shipped to the customer!"
        }//a aa

        // Displaying notification that the product was paid
        self.setState({
          showNotification: true,
          notificationMessage: message
        });
      }
    })

    // Getting all products from contract c
    await this.getAllProductsFromContract();
  }



  render() {
    if (!this.state.web3Loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <Header />
        <NewItem productManager={this.productManager} account={this.accounts[0]} updateProducts={this.getAllProductsFromContract} />
        <Container style={{ 'marginTop': '2%', 'width': '100%' }}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <ProductTable
                  rows={this.state.productsNew}
                  title={'New'}
              />
            </Grid>
            <Grid item xs={6}>
              <SimpleProductTable
                  rows={this.state.productsPaid}
                  title={'Paid'}
                  productManager={this.productManager}
                  account={this.accounts[0]}
                  updateProducts={this.getAllProductsFromContract}
              />
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={8}>
              <ProductTable
                  rows={this.state.productsDelivered}
                  title={'Delivered'}
              />
            </Grid>
            <Grid item xs={2}></Grid>
          </Grid>
        </Container>
        <Notification open={this.state.showNotification} message={this.state.notificationMessage} handleClose={this.toggleNotification} />

      </div>
    );
  }
}

export default App;
