const Order = require("./order");

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  Fullname: String, 
  email: String,
  password: {
    type: String,
    required: true,
  },
  address: String, 
  phoneNumber: String, 
  isAdmin: {
    type: Boolean,
    default: false, 
  },
  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        _id: false,
      },
    ],
  },
});


userSchema.methods.addToCart = function (id) {
  let cartItemIndex = this.cart.items.findIndex((p) => {
    // console.log(
    //   p.productId,
    //   "  ==  ",
    //   product._id,
    //   p.productId == product._id
    // );
    return p.productId.toString() == id.toString();
  });

  if (cartItemIndex >= 0) {
    this.cart.items[cartItemIndex].quantity++;
    // console.log("sao khong co o day");
  } else {
    this.cart.items.push({ productId: id, quantity: 1 });
  }
  return this.save();
};

userSchema.methods.deleteCartItemById = function (productId) {
  if (!this.cart || !this.cart.items) {
    return Promise.reject(new Error('Cart or cart items are not initialized'));
  }
  const getItemIndex = this.cart.items.findIndex((p) => {
    // Kiểm tra xem p và p.productId có tồn tại không trước khi sử dụng toString()
    return p && p.productId && p.productId.toString() === productId.toString();
  });
  // Nếu không tìm thấy phần tử, trả về lỗi
  if (getItemIndex === -1) {
    return Promise.reject(new Error('Item not found in cart'));
  }
  this.cart.items.splice(getItemIndex, 1);
  return this.save();
};


userSchema.methods.removeFromCart = function(productId) {
  if (!this.cart) {
    return Promise.reject(new Error('Cart is not initialized'));
  }
  if (!this.cart.items || this.cart.items.length === 0) {
    return Promise.reject(new Error('Cart items are not initialized or empty'));
  }
  // Tìm index của phần tử có productId tương ứng trong mảng
  const itemIndex = this.cart.items.findIndex(item => item.productId && item.productId.toString() === productId.toString());
  if (itemIndex === -1) {
    return Promise.reject(new Error('Item not found in cart'));
  }
  this.cart.items.splice(itemIndex, 1);
  return this.save();
};






userSchema.methods.addOrder = function () {
  return this.populate("cart.items.productId")
    .then((user) => {
      const products = [];
      for (let productData of user.cart.items) {
        products.push({
          product: { ...productData.productId },
          quantity: productData.quantity,
        });
      }
      // Thêm thông tin của khách hàng vào đơn hàng
      const order = new Order({
        products: products,
        user: {
          email: this.email,
          _id: this._id, 
        },
      });
      return order.save();
    })
    .then((_) => {
      this.cart.items = [];
      return this.save();
    })
    .then((_) => {
      console.log("Done new Order");
    })
    .catch((err) => console.log(err));
};


userSchema.methods.getOrders = function () {
  return Order.find({ "user._id": this._id });
};
userSchema.methods.updateCartItem = function(productId, newQuantity) {
  const cartItem = this.cart.items.find(item => item.productId.toString() === productId.toString());

  if (!cartItem) {
    return Promise.reject(new Error('Item not found in cart'));
  }

  cartItem.quantity = newQuantity;

  return this.save();
};

module.exports = mongoose.model("User", userSchema);

