const MyToken = artifacts.require('./MyToken.sol');

contract('MyToken', (accounts) => {
  let NFTInstance;
  const owner1 = accounts[1];
  const owner2 = accounts[2];

  before(async () => {
    NFTInstance = await MyToken.new();
  });

  it('Test that the smart contract can create a new NFT', async () => {
    const id = 1;
    const name = 'test1';
    const description = 'Test that the smart contract can create a new NFT';

    await NFTInstance.createNFT(id, name, description, { from: owner1 });
    const tokenMetadataString = await NFTInstance.getMetadata(1);
    const metadata = JSON.parse(tokenMetadataString);

    // Assert that the metadata is correct
    assert.equal(metadata.name, name);
    assert.equal(metadata.description, description);

    // print information
    var obj = {'metadata.name':metadata.name,'metadata.description':metadata.description};
    console.log(obj);

  });

  it('Test that the smart contract can transfer ownership of an NFT', async () => {
    const id = 2;
    const name = 'test2';
    const description = 'Test that the smart contract can transfer ownership of an NFT';

    await NFTInstance.createNFT(id, name, description, { from: owner1 });
    await NFTInstance.transferNFT(owner2, id, { from: owner1 });
    const owner = await NFTInstance.ownership(id);

    assert.equal(owner2, owner);

    // print information
    var obj = {'owner2':owner2};
    console.log(obj);
  });

  it('Test that the smart contract can list an NFT for sale', async () => {
    const id = 3;
    const name = 'test3';
    const description = 'Test that the smart contract can list an NFT for sale';
    const price = 300000000;

    await NFTInstance.createNFT(id, name, description, { from: owner1 });
    await NFTInstance.listNFTForSale(id, price, { from: owner1 });
    const onsale = await NFTInstance.onSale.call(id);
    const price_online = await NFTInstance.price.call(id);

    assert.equal(onsale, true);
    assert.equal(price_online, price);

    // print information
    var obj = {'onsale':onsale,'price_online':price_online};
    console.log(obj);
  });

  it('Test that the smart contract can remove an NFT from sale', async () => {
    const id = 4;
    const name = 'test4';
    const description = 'Test that the smart contract can remove an NFT from sale';
    const price = 400000000;

    await NFTInstance.createNFT(id, name, description, { from: owner1 });
    await NFTInstance.listNFTForSale(id, price, { from: owner1 });
    await NFTInstance.removeNFTFromSale(id, { from: owner1 });
    const onsale = await NFTInstance.onSale.call(id);

    assert.equal(onsale, false);
    // print information
    var obj = {'onsale':onsale};
    console.log(obj);
  });

  it('Test that the smart contract can execute a successful NFT purchase', async () => {
    const id = 5;
    const name = 'test5';
    const description = 'Test that the smart contract can execute a successful NFT purchase';
    const price = 500000000;

    await NFTInstance.createNFT(id, name, description, { from: owner1 });
    await NFTInstance.listNFTForSale(id, price, { from: owner1 });
    const balanceBefore = await web3.eth.getBalance(owner1);
    const receipt = await NFTInstance.purchaseNFT(id, { from: owner2, value:price+1000 });
    const balanceAfter = await web3.eth.getBalance(owner1);
    const owner = await NFTInstance.ownership(id);
    // const gasUsed = receipt.receipt.gasUsed;
    // const gasPrice = receipt.receipt.gasPrice;

    assert.equal(owner2, owner);
    assert.approximately(balanceAfter-balanceBefore, price, 100000); // approximate due to transaction fee

    // print information
    var obj = {'owner2':owner2,'balanceBefore':balanceBefore,'balanceAfter': balanceAfter};
    console.log(obj);

  });

  it('Test that the smart contract can execute an unsuccessful NFT purchase', async () => {
    const id = 6;
    const name = 'test6';
    const description = 'Test that the smart contract can execute an unsuccessful NFT purchase';
    const price = 600000000;

    await NFTInstance.createNFT(id, name, description, { from: owner1 });
    await NFTInstance.listNFTForSale(id, price, { from: owner1 });
    const balanceBefore = await web3.eth.getBalance(owner1);
    try {
      await NFTInstance.purchaseNFT(id, { from: owner2, value: price/2 });
    }
    catch {
      const balanceAfter = await web3.eth.getBalance(owner1);
      const owner = await NFTInstance.ownership(id);

      assert.equal(owner1, owner); // ownership remains
      assert.equal(balanceAfter, balanceBefore); // no Ether was transferred
      // print information
      var obj = {'owner1':owner1,'balanceAfter':balanceAfter,'balanceBefore':balanceBefore};
      console.log(obj);
    }
    
  });
})