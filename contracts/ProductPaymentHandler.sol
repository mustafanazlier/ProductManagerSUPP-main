// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0.;

import "./ProductManager.sol";


contract ProductPaymentHandler{

    uint public price;
    uint public index;
    bool public isProductPurchased;
    ProductManager public parentContract;

    constructor(ProductManager _parentContract, uint _idex, uint _price) public {
        parentContract = _parentContract;
        index = _idex;
        price = _price;
    }


    receive() external payable {
        require(!isProductPurchased, "Product is already paid.");
        require(msg.value == price, "You must pay the exact amout that product costs.");



        (bool success, ) = address(parentContract).call.value(msg.value)(abi.encodeWithSignature("triggerPayment(uint256)", index));
        require(success, "Transaction wan't successful.");

        isProductPurchased = true;
    }
}