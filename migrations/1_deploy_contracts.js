var NFTCollection = artifacts.require("./MyToken.sol");

module.exports = function(deployer) {
  deployer.deploy(NFTCollection);
};
