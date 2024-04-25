const Product = require("../models/product");
// const Cart = require("../models/cart");

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "index",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};
exports.getProductsJson = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    });
};
exports.getProducts = (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return productsController.getProductsJson(req, res, next);
  }

  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};


exports.getProductDetails = (req, res, next) => {
  let prodID = req.params.productID;
  Product.findById(prodID)
    .then((product) => {
      // console.log("Doc : ", product);
      res.render("shop/product-details", {
        product: product ? [product] : [],
        pageTitle: "Product details",
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};
exports.getCartJson = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      res.json(user.cart.items);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    });
};

exports.getCart = (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return productsController.getCartJson(req, res, next);
  }

  req.user
    .populate("cart.items.productId")
    .then((user) => {
      res.render("shop/cart", {
        pageTitle: "Cart",
        path: "/cart",
        products: user.cart.items,
      });
    })
    .catch((err) => console.log(err));
};

exports.addToCart = (req, res, next) => {
  let ID = req.body.productID;

  const cartTotalQuantity = req.user.cart.items.reduce((total, item) => total + item.quantity, 0);
  if (cartTotalQuantity >= 100) {
    return res.status(400).send("You need to remove products from the cart first to add more");
  }
  
  req.user.addToCart(ID)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};


exports.deleteCartItem = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeFromCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.removeFromCart = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .removeFromCart(productId) 
    .then(result => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.updateCartItem = (req, res, next) => {
  const productId = req.body.productId;
  const newQuantity = req.body.quantity;

  if (newQuantity <= 0 || newQuantity > 100) {
    return res.status(400).send("Invalid quantity.");
  }

  req.user.updateCartItem(productId, newQuantity)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};


exports.getOrdersJson = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      res.json(orders);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      orders.forEach(order => {
        // tinh tổng gtri đơn 
        const totalPrice = order.products.reduce((total, product) => total + (product.product.price * product.quantity), 0);
        order.totalPrice = totalPrice;
      });
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
