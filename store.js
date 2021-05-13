const availablePincodes = ["110095","110092","110040","201301","110085","110086","231221","142001","244715","110091","110001","124108","110034","124401","110031","110035","110032","110075","110041","110027","122002","110089","421201","362001","400080","759122","147201"];

const getPincodes = () => availablePincodes;

const storePincode = (pincode) => {
  if (!availablePincodes.includes(pincode)) {
    availablePincodes.push(pincode);
  }
  return availablePincodes;
}


module.exports = {
  getPincodes,
  storePincode
}