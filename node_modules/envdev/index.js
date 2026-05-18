var envdev = function(){  
  this._is_dev = !!process.argv.find(function(arg){
    return arg === '--dev';
  });
}

envdev.prototype.isDev = function(){
  return this._is_dev;
}

module.exports = new envdev();