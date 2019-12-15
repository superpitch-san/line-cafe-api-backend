const express = require('express');
const router = express.Router();
const line = require('@line/bot-sdk');
const uuidV4 = require('uuid/v4');
const cors = require('cors');
const config = {
  channelAccessToken: process.env.LINE_ACCESSTOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
}
const Client = new line.Client(config);
const lineMessage = require('../public/line/messages/messages');
const axios = require('axios');

const psqlUser = process.env.POSTGRESQL_USERNAME;
const psqlPass = process.env.POSTGRESQL_PASSWORD;
const psqlHost = process.env.POSTGRESQL_HOST;
const psqlPort = process.env.POSTGRESQL_PORT;
const psqlDBName = process.env.POSTGRESQL_DBNAME;
const pgp = require('pg-promise')();
const db = pgp(`postgres://${psqlUser}:${psqlPass}@${psqlHost}:${psqlPort}/${psqlDBName}`);

const fcmURL = process.env.FCM_URL;
const fcmServerKey = process.env.FCM_SERVER_KEY;
const fcmToken = process.env.FCM_TOKEN;

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {title: 'Express'});
});

/* GET all of cusomter orders */
router.get('/orders', cors(), (req, res, next) => {
  db.any(
    'SELECT customer_orders.order_id, customer_orders.product_id, customer_orders.line_id, products.product_name, products.product_image, products.product_price FROM customer_orders INNER JOIN products ON customer_orders.product_id = products.product_id WHERE customer_orders.is_serve = false'
  )
  .then((data) => {
    if (data && data.length > 0) {
      return res.send(data);
    } else {
      return res.send(null);
    }
  })
  .catch((err) => res.status(400).send(err));
});

router.options('/orders/serve', cors());
router.post('/orders/serve', cors(), (req, res, next) => {
  if (req.body) {
    db.result(
      'UPDATE customer_orders SET is_serve=true, updated_at=now() WHERE order_id=${orderId}',
      req.body
    )
    .then((data) => {
      if (data && data.rowCount > 0) {
        Client.pushMessage(
          req.body.lineId,
          lineMessage.textServedMessage(
            { 
              productName: req.body.productName
            }
          )
        );
        // push notification to backend for update status
        return res.status(200).send(
          { 
            userId: req.body.lineId,
            orderStatus: 'served'
          }
        );
      }
    })
    .catch((err) => res.status(400).send(err));
  }
});

/* GET all of products */
router.get('/products', cors(), (req, res, next) => {
  db.any(
    'SELECT * FROM products'
  )
  .then((data) => {
    if (data && data.length > 0) {
      return res.send(data);
    } else {
      return res.send(null);
    }
  })
  .catch((err) => res.status(400).send(err));
});

/* POST for create product */
router.options('/createProduct', cors());
router.post('/createProduct', cors(), (req, res, next) => {
  if (req.body) {
    db.any('SELECT product_name FROM products')
    .then((data) => {
      if (data && data.length > 0) {
        const filter = data.filter(product => product.product_name === req.body.productName);
        if (filter && filter.length > 0) {
          return res.status(400).send({ createProduct: 'duplicate' });
        } else {
          db.none(
            'INSERT INTO products(product_id, product_name, product_price, product_image, created_at) VALUES(${productId}, ${productName}, ${productPrice}, ${productImage}, ${createdAt})',
            {
              productId: uuidV4(),
              productName: req.body.productName,
              productPrice: req.body.productPrice,
              productImage: req.body.productImage,
              createdAt: new Date().toISOString()
            }
          )
          .then(() => res.status(200).send({ createProduct: 'success' }))
          .catch((err) => res.status(400).send(err));
        }
      } else {
        db.none(
          'INSERT INTO products(product_id, product_name, product_price, product_image, created_at) VALUES(${productId}, ${productName}, ${productPrice}, ${productImage}, ${createdAt})',
          {
            productId: uuidV4(),
            productName: req.body.productName,
            productPrice: req.body.productPrice,
            productImage: req.body.productImage,
            createdAt: new Date().toISOString()
          }
        )
        .then(() => res.status(200).send({ createProduct: 'success' }))
        .catch((err) => res.status(400).send(err));
      }
    })
    .catch((err) => res.status(400).send(err))
  } else {
    return res.status(400).send(null);
  }
});

router.options('/deleteProduct', cors());
router.delete('/deleteProduct', cors(), (req, res, next) => {
  if (req.body) {
    db.any(
      'SELECT product_id FROM products'
    )
    .then((data) => {
      if (data && data.length > 0) {
        data.forEach((product) => {
          if (product.product_id === req.body.productId) {
            db.result(
              'DELETE FROM products WHERE product_id=${productId}',
              req.body
            )
            .then(() => res.status(200).send({ deleteProductStatus: 'success' }))
            .catch((err) => res.status(400).send(err));
          }
        })
      }
    })
    .catch((err) => res.status(400).send(err));
  } else {
    return res.status(400).send(null);
  }
});

// TODO: remove product, serve product to user 

/* POST for line chatbot webhook */
router.post('/webhook', (req, res) => {
  if (req.body) {
    const type = req.body.events[0].type;
    switch (type) {
      case 'message':
        replyMessage(req.body);
        break;
    }
  }
});

replyMessage = event => {
  if (event) {
    const order = event.events[0].message.text.split('-');
    if (order[0] === 'menu') {
      db.any('SELECT product_name, product_id FROM products')
      .then((data) => {
        if (data && data.length > 0) {
          const filter = data.filter(product => product.product_name === order[1]);
          if (filter && filter.length > 0) {
            db.none(
              'INSERT INTO customer_orders(order_id, product_id, line_id, is_serve, created_at) VALUES(${orderId}, ${productId}, ${lineId}, ${isServe}, ${createdAt})', 
              {
                orderId: uuidV4(),
                productId: filter[0].product_id, // TODO: get product id from liff
                lineId: event.events[0].source.userId,
                isServe: false,
                createdAt: new Date().toISOString(),
              }
            )
            .then(() => {
              axios.defaults.headers.post['Content-Type'] = 'application/json';
              axios.defaults.headers.post['Authorization'] = `key=${fcmServerKey}`;
              axios.post(
                fcmURL,
                {
                  to: fcmToken,
                  priority: 'high',
                  data: {
                    title: 'Line Cafe',
                    text: 'New order incomming'
                  }
                }
              )
              .then((res) => {
                return Client.replyMessage(
                  event.events[0].replyToken,
                  lineMessage.textMessage(order[1])
                );
              })
              .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
          } else {
            return Client.replyMessage(
              event.events[0].replyToken,
              lineMessage.textErrorMessage()
            );
          }
        }
      })
    } else {
      return Client.replyMessage(
        event.events[0].replyToken,
        lineMessage.textErrorMessage()
      );
    }
  }
}

module.exports = router;
