const fetch = require('node-fetch'), fs = require('fs'),
      csvConverter = require('csvtojson');

class Bol {
  constructor(APIKEY, SECRET) {
    this.API = APIKEY;
    this.SECRET = SECRET;
    this.bol_token; this.expires_in;
  }
  async bolHeader(tries=3) {
    return new Promise(async(resolve, reject) => {
      try {
        if(!this.bol_token || this.expires_in < new Date().getTime()) await this.bolAccess(tries);
        return resolve({"Accept": "application/vnd.retailer.v7+json", "Content-Type": 'application/vnd.retailer.v7+json', "Authorization": "Bearer " + this.bol_token});
      } catch(e) {
        tries--;
        if(tries <= 0) return reject(e);
        return setTimeout(() => resolve(this.bolHeader(tries)), 2000);
      }
    });
  }
  async bolAccess(tries=3) {
    return new Promise(async(resolve, reject) => {
      try {
        let resp = await fetch('https://login.bol.com/token?grant_type=client_credentials', {method: 'POST', body: {}, headers: {"Content-Type": "application/json", "Authorization": "Basic " + Buffer.from(this.APIKEY + ":" + this.SECRET).toString('base64')}});
            resp = await resp.json();
        this.bol_token = resp.access_token;
        this.expires_in = new Date().getTime() + resp.expires_in * 1000;
        return resolve();
      } catch(e) {
        tries--;
        if(tries <= 0) return reject(e);
        return setTimeout(() => resolve(this.bolAccess(tries)), 2000);
      }
    });
  }
  async pause(offer_id, hold, fulfilment, tries=3) {
    return new Promise(async(resolve, reject) => {
      try {
        let resp = await fetch('https://api.bol.com/retailer/offers/' + offer_id, {method: 'PUT', body: JSON.stringify({onHoldByRetailer: hold, fulfilment: {method: method}}), headers: await this.bolHeader(2)});
            resp = await resp.json();
        return resolve();
      } catch(e) {
        console.error(e);
        tries--;
        if(tries <= 0) return reject(e);
        return setTimeout(() => resolve(this.pause(offer_id, hold, fulfilment, tries)), 2000);
      }
    });
  }
  async stock(offer_id, stock, managedByRetailer, tries=3) {
    return new Promise(async(resolve, reject) => {
      try {
        let resp = await fetch('https://api.bol.com/retailer/offers/' + offer_id + '/stock', {method: 'PUT', body: JSON.stringify({amount: stock, managedByRetailer: managedByRetailer}), headers: await this.bolHeader(2)});
            resp = await resp.json();
        return resolve();
      } catch(e) {
        tries--;
        if(tries <= 0) return reject(e);
        return setTimeout(() => resolve(this.stock(offer_id, stock, managedByRetailer, tries=3)), 2000);
      }
    });
  }
  async delivery(offer_id, fulfilment, tries=3) {
    return new Promise(async(resolve, reject) => {
      try {
        let resp = await fetch('https://api.bol.com/retailer/offers/' + offer_id, {method: 'PUT', body: JSON.stringify({fulfilment: fulfilment}), headers: await this.bolHeader(2)})
        if(resp.ok) return resolve(true);
        tries--;
        if(tries <= 0) return reject(resp);
        return setTimeout(() => resolve(this.delivery(offer_id, fulfilment, tries)), 2000);
      } catch(e) {
        tries--;
        if(tries <= 0) return reject(e);
        return setTimeout(() => resolve(this.delivery(offer_id, fulfilment, tries)), 2000);
      }
    });
  }
  async export(tries=3) {
    return new Promise(async(resolve, reject) => {
      try {
        let headers = await this.bolHeader(3);
            headers['Content-Type'] = headers['Accept'];
        let resp = await fetch('https://api.bol.com/retailer/offers/export', {method: 'POST', body: JSON.stringify({format: 'CSV'}), headers: headers});
            resp = await resp.json();
        let exportId = resp.processStatusId, csv;
        if(!resp.links) return reject();
        do {
          await new Promise(res => setTimeout(res, 20e3));
          headers = await this.bolHeader(3);
          let status = await fetch(resp.links[0].href, {method: 'GET', headers: headers});
              status = await status.json();
          if(status.status == 'SUCCESS') {
            exportId = status.entityId;
            headers = await this.bolHeader(3);
            headers['Accept'] = 'application/vnd.retailer.v7+csv';
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            let exported = await fetch('https://api.bol.com/retailer/offers/export/' + exportId, {method: 'GET', headers: headers});
            if(exported.status != 200) return reject();
            const fileStream = fs.createWriteStream('./export_offers.csv', {flags: 'w'});
            try {
              await new Promise((res, rej) => {
                exported.body.pipe(fileStream);
                exported.body.on('error', (err) => {
                  console.error(err);
                  rej();
                });
                fileStream.on('finish', () => {
                  csv = true;
                  res();
                });
              });
            } catch(e) {
              return reject(e);
            }
          }
        } while(!csv);
        csvConverter().fromFile('./export_offers.csv').then(json => {
          return resolve(json);
        }).catch(err => {
          console.error(err);
          return reject();
        })
      } catch(e) {
        console.error(e);
        tries--;
        if(tries <= 0) return reject();
        return setTimeout(() => resolve(this.bolExport(tries)), 2000);
      }
    });
  }
  async orders(page, status, tries=3) {
    return new Promise(async(resolve, reject) => {
      try {
        let resp = await fetch('https://api.bol.com/retailer/orders?page=' + page + '&status=' + status, {method: 'GET', headers: await this.bolHeader(2)});
            resp = await resp.json();
        if(resp.orders == undefined) resp.orders = [];
        return resolve(resp.orders);
      } catch(e) {
        tries--;
        if(tries <= 0) return reject();
        return setTimeout(() => resolve(this.orders(page, status, tries)), 2000);
      }
    });
  }
  async detail(order_id, tries=3) {
    return new Promise(async(resolve, reject) => {
      try {
        let resp = await fetch('https://api.bol.com/retailer/orders/' + order_id, {method: 'GET', headers: await this.bolHeader(2)});
            resp = await resp.json();
        return resolve(resp);
      } catch(e) {
        tries--;
        if(tries <= 0) return reject();
        return setTimeout(() => resolve(this.detail(order_id, tries)), 2000);
      }
    });
  }
  async price(offer_id, price, tries=3) {
    return new Promise(async(resolve, reject) => {
      try {
        let resp = await fetch('https://api.bol.com/retailer/offers/' + offer_id + '/price', {method: 'PUT', body: JSON.stringify({pricing: {bundlePrices: [{quantity: 1, unitPrice: price}]}}), headers: await this.bolHeader(2)});
            resp = await resp.json();
        return resolve(resp);
      } catch(e) {
        tries--;
        if(tries <= 0) return reject();
        return setTimeout(() => resolve(this.price(offer_id, price, tries)), 2000);
      }
    });
  }
}

module.exports = Bol;
