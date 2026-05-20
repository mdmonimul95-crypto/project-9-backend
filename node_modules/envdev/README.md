# envdev

## Usage

somescript.js

```js
var envdev = require('envdev');

if(envdev.isDev()){
  console.log('dev');
} else {
  console.log('prod');
}
```


```
node somescript.js
// prod

node somescript.js --dev
// dev
```
