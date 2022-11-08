"use strict";
const https = require("https");

const getStockPrice = (stock) => {
  return new Promise((resolve, reject) => {
    const request = https.get(
      `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
    );
    request.on("response", (response) => {
      let chunk = "";
      response.on("data", (data) => {
        chunk += data.toString();
      });
      response.on("end", () => {
        resolve(JSON.parse(chunk));
      });

      response.on("error", (err) => {
        reject(err);
      });
    });
  });
};

const stockLikeMap = new Map();

const getStockKeyName = (ip, key) => {
  return `${ip}:${key.toLowerCase()}`;
};

const getLikeCount = (ip, stock) => {
  return stockLikeMap.get(getStockKeyName(ip, stock)) || 0;
};

const getRelLikeCount = (ip, stocks) => {
  let [firstStock, SecondStock] = stocks;
  let firstStockRelLikes =
  stockLikeMap.get(getStockKeyName(ip, firstStock)) || 0;
  let secondStockRelLikes =
  stockLikeMap.get(getStockKeyName(ip, SecondStock)) || 0;
  return firstStockRelLikes - secondStockRelLikes;
};

module.exports = function (app) {
  app.set("trust proxy", 1);

  app
    .route("/api/stock-prices")
    .get(async function (req, res) {
      const { stock, like } = req.query;
      const { ip } = req;
      const isSingle = typeof stock === "string";
      const stocks = isSingle ? [stock] : stock;
      const likeValue = like === "true";

      const promises = stocks.map((stock) => getStockPrice(stock));

      if (likeValue) {
        stocks.forEach((stock) => {
          let stockKeyName = getStockKeyName(ip, stock);
          if (!stockLikeMap.has(stockKeyName)) {
            stockLikeMap.set(stockKeyName, getLikeCount(ip, stock) + 1);
          }
        })
      }

      try {
        const stocksResult = (await Promise.all(promises)).map((data, index) => {
          let isValid = typeof data !== "string";
          let result = {};

          if (isSingle) {
            result.likes = getLikeCount(ip, stocks[0]);
          } else {
            result.rel_likes = getRelLikeCount(ip, [stocks[index].toLowerCase(), ...stocks.map((stock) => stock.toLowerCase())]);
          }

          if (!isValid) {
            return result;
          }

          result.stock = data.symbol;
          result.price = data.latestPrice;
          return result;
        });

        res.json({ stockData: isSingle ? stocksResult[0] : stocksResult });
      } catch (err) {
        res.json({ error: err.message });
      }
    });
};
