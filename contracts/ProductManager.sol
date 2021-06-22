pragma solidity ^0.6.0.;
import "./Ownable.sol";
import "./ProductPaymentHandler.sol";


contract ProductManager is Ownable{


    enum ProductState{Created, Paid, Delivered}


    struct Product{
        string productUid;
        uint price;
        ProductState state;
        ProductPaymentHandler paymentHandler;
    }


    mapping(uint => Product) public products;
    uint public index;


    event ProductStateChanged(uint _productIndex, uint _step, address productPaymentAddress);


    function createProduct(string memory _id, uint _price) public onlyOwner {
        ProductPaymentHandler paymentHandler = new ProductPaymentHandler(this, index, _price);
        products[index].paymentHandler = paymentHandler;
        products[index].productUid = _id;
        products[index].price = _price;
        products[index].state = ProductState.Created;

        emit ProductStateChanged(index, uint(products[index].state), address(products[index].paymentHandler));
        index++;
    }

    function triggerPayment(uint _productIndex) public payable{
        require(products[_productIndex].price <= msg.value, "Can't purchase the product, not enough money.");
        require(products[_productIndex].state == ProductState.Created, "Can't purchase the product, product is already purchased or sent for delivery");

        products[_productIndex].state = ProductState.Paid;
        emit ProductStateChanged(_productIndex, uint(products[_productIndex].state), address(products[_productIndex].paymentHandler));
    }


    function triggerDelivery(uint _productIndex) public onlyOwner {
        require(products[_productIndex].state == ProductState.Paid, "Product must be paid first, to be sent for delivery");

        products[_productIndex].state = ProductState.Delivered;
        emit ProductStateChanged(_productIndex, uint(products[_productIndex].state), address(products[_productIndex].paymentHandler));
    }


    function withdraw() public onlyOwner{
        msg.sender.transfer(address(this).balance);
    }


    function renounceOwnership() public onlyOwner {
        revert("You're not able to renounce ownership");
    }
}