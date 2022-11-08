const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test("Viewing one stock: GET request to /api/stock-prices/", (done) => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: "GOOG" })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData', 'Stock Prices should contain stockData');
          assert.strictEqual(res.body.stockData.stock, "GOOG");
          done();
        });
    });

    test("Viewing one stock and liking it: GET request to /api/stock-prices/", (done) => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: "GOOG", like: true })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData', 'Stock Prices should contain stockData');
          assert.strictEqual(res.body.stockData.stock, "GOOG");
          assert.strictEqual(res.body.stockData.likes, 1);
          done();
        });
    });

    test("Viewing the same stock and liking it again: GET request to /api/stock-prices/", (done) => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: "GOOG", like: true })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData', 'Stock Prices should contain stockData');
          assert.strictEqual(res.body.stockData.stock, "GOOG");
          assert.strictEqual(res.body.stockData.likes, 1);
          done();
        });
    });

    test("Viewing two stocks: GET request to /api/stock-prices/", (done) => {
        chai.request(server)
        .get(`/api/stock-prices?stock=GOOG&stock=MSFT`)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData', 'Stock Prices should contain stockData');
          assert.isArray(res.body.stockData, "stockData should have array result");
          assert.strictEqual(res.body.stockData[0].rel_likes, 0, "first index rel_likes should be 0");
          assert.strictEqual(res.body.stockData[1].rel_likes, -1, "second index rel_likes should be -1");
          done();
        });
    });

    test("Viewing two stocks and liking them: GET request to /api/stock-prices/", (done) => {
        chai.request(server)
        .get(`/api/stock-prices?stock=GOOG&stock=MSFT&like=true`)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData', 'Stock Prices should contain stockData');
          assert.isArray(res.body.stockData, "stockData should have array result");
          assert.strictEqual(res.body.stockData[0].rel_likes, 0, "first index rel_likes should be 0");
          assert.strictEqual(res.body.stockData[1].rel_likes, 0, "second index rel_likes should be 0");
          done();
        });
    });
});
