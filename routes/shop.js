// core modules
const express = require("express");
const path = require("path");

// custome modules
const productsController = require("../controllers/shop");
const isAuth = require("../middleware/isAuth");
const router = express.Router();

router.get("/", productsController.getIndex);

router.get("/products", productsController.getProducts);
// router.get(
//   "/products/:productID",
//   isAuth, 
//   productsController.getProductDetails
// );
router.get("/products/:productID", productsController.getProductDetails);

router.get("/cart", isAuth, productsController.getCart);
router.get("/orders", isAuth, productsController.getOrders);
router.post("/cart", isAuth, productsController.addToCart);
router.post("/cart-update-item", isAuth, productsController.updateCartItem);
router.post("/cart-delete-item", isAuth, productsController.deleteCartItem);
router.post("/orders", isAuth, productsController.postOrder);

// api 
router.get("/api/products", productsController.getProductsJson);
router.get("/api/cart", productsController.getCartJson);
router.get("/api/orders", productsController.getOrdersJson);

module.exports = router;
