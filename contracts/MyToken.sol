// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyToken is ERC721 {
    constructor() ERC721("MyToken", "MT") {}
    struct TokenMetadata {
        string name;
        string description;
    }
    mapping(uint256 => TokenMetadata) tokens;
    mapping(uint256 => bool) tokenExist;
    mapping(uint256 => bool) public onSale;
    mapping(uint256 => uint) public price;

    function mint(uint256 _id, string memory _name, string memory _description) private {
        require(!tokenExist[_id], "NFT already exists!");

        tokens[_id] = TokenMetadata(_name, _description);
        _mint(msg.sender, _id);
        tokenExist[_id] = true;
    }

    function createNFT(uint256 _id, string memory _name, string memory _description) public {
        mint(_id, _name, _description);
    }

    function ownership(uint256 _id) public view returns(address) {
        return ownerOf(_id);
    }

    function getMetadata(uint256 _id) public view returns(string memory) {
        require(tokenExist[_id], "NFT does not exist!");
        string memory json = string(
        abi.encodePacked(
            '{"name":"', tokens[_id].name, '", ',
            '"description":"', tokens[_id].description, '"',
            // Include any other metadata fields here
            '}'
            )
        );
        return json;
    }

    function transferNFT(address _to, uint256 _id) public {
        require(tokenExist[_id], "NFT does not exist!");
        require(ownerOf(_id) == msg.sender, "NFT does not own by the from address!");
        require(_to != address(0), "Transfer to 0 address not allowed!");

        safeTransferFrom(msg.sender, _to, _id);
    }

    function listNFTForSale(uint256 _id, uint _price) public {
        require(tokenExist[_id], "NFT does not exist!");
        require(ownerOf(_id) == msg.sender, "NFT does not own by the from address!");

        price[_id] = _price;
        onSale[_id] = true;
    }

    function checkSale(uint256 _id) public view returns(uint) {
        require(tokenExist[_id], "NFT does not exist!");
        require(onSale[_id], "NFT is not on sale!");
        return price[_id];
    }

    function removeNFTFromSale(uint256 _id) public {
        require(tokenExist[_id], "NFT does not exist!");
        require(ownerOf(_id) == msg.sender, "NFT does not own by the from address!");

        onSale[_id] = false;
    }

    function purchaseNFT(uint256 _id) public payable {
        require(tokenExist[_id], "NFT does not exist!");
        require(msg.value >= price[_id], "ETH not enough!");

        if(msg.value>price[_id]) {
            assert(msg.value-price[_id] < msg.value);
            payable(msg.sender).transfer(msg.value-price[_id]);
        }
        payable(ownerOf(_id)).transfer(price[_id]);
        _transfer(ownerOf(_id), msg.sender, _id); // TODO: not safe. Any other method?
        onSale[_id] = false;
    }
}
