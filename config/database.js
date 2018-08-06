if (process.env.NODE_ENV === 'production') {
  module.exports = {
    mongoURI: 'mongodb://kavitha:Srilakshmi7@ds113522.mlab.com:13522/tcprod'
  };
} else {
  module.exports = { mongoURI: 'mongodb://localhost/tc-test' };
}
