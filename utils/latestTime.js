// Returns the time of the last mined block in seconds
module.exports = async function latestTime() {
  return (await web3.eth.getBlock('latest')).timestamp;
};
