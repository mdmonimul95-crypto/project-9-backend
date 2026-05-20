var assert = require("assert");

describe('envdev', function(){
  it('false', function(){
    delete require.cache[require.resolve('./index.js')];
    process.argv = process.argv.filter(function(arg){
      return arg != '--dev';
    });
    var envdev = require('./index.js');
    assert.equal(false, envdev.isDev());
  });

  it('true', function(){
    delete require.cache[require.resolve('./index.js')];
    process.argv.push('--dev');
    var envdev = require('./index.js');
    assert.equal(true, envdev.isDev());
  });
});
  