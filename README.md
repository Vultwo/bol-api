# Bol API
API functions for bol.com sellers<br>
v7 api: https://api.bol.com/retailer/public/redoc/v7/retailer.html
<br>
Let me know if you require any additional functions.
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
https://api.bol.com/retailer/public/redoc/v7/retailer.html#operation/put-offer
```javascript
let offer_id = "",
    pause = true,
    method = "FBR", // "FBR" OR "FBB" (see docs)
    tries = 3; // default
await bol.pause(offer_id, pause, method, tries);
```
### Set stock
https://api.bol.com/retailer/public/redoc/v7/retailer.html#operation/update-offer-price
```javascript
let offer_id = "",
    stock = 123, // max = 999
    managedByRetailer = true,
    tries = 3; // default
await bol.stock(offer_id, stock, tries);
```
### Set delivery
https://api.bol.com/retailer/public/redoc/v7/retailer.html#operation/put-offer
```javascript
let offer_id = "",
    fulfilment = "1-2d", // see docs for all codes
    tries = 3; // default
await bol.delivery(offer_id, fulfilment, tries);
```
### Offer export
https://api.bol.com/retailer/public/redoc/v7/retailer.html#operation/get-offer-export
```javascript
let tries = 3; // default
await bol.export(tries);
// returns csv in JSON format
```
### Get orders
https://api.bol.com/retailer/public/redoc/v7/retailer.html#operation/get-orders
```javascript
let page = 1,
    status = "ALL", // "OPEN" || "ALL"
    tries = 3; // default
await bol.orders(page, status, tries);
```
### Order detail
https://api.bol.com/retailer/public/redoc/v7/retailer.html#operation/get-order
```javascript
let order_id = "",
    tries = 3; // default
await bol.detail(order_id, tries);
```
### Set price
https://api.bol.com/retailer/public/redoc/v7/retailer.html#operation/update-offer-price
<br>Currently no bundlePrices support please open a issue if you would like to see this feature.
```javascript
let offer_id = "",
    price = 19.99,
    tries = 3; // default
await bol.price(offer_id, price, tries);
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
