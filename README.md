# Bol API
API functions for bol.com sellers

## Installation

#### NPM
Use the package manager npm to install bol-api.

```bash
npm i bol-api
```

## Usage
### Initialization
```javascript
const Bol = require('bol-api'),
      bol = new Bol(API_KEY, API_SECRET);
```
### Pause offer
```javascript
let offer_id = "",
    pause = true,
    tries = 3; // default
await bol.pause(offer_id, pause, tries);
```
### Set stock
```javascript
let offer_id = "",
    stock = 123, // max = 999
    managedByRetailer = true,
    tries = 3; // default
await bol.stock(offer_id, stock, tries);
```
### Set delivery
```javascript
let offer_id = "",
    fulfilment = "1-2d",
    tries = 3; // default
await bol.delivery(offer_id, fulfilment, tries);
```
### Offer export
```javascript
let tries = 3; // default
await bol.export(tries);
// returns csv in JSON format
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
