//custome module
const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

exports.getAdminDashboard = (req, res, next) => {
  let totalUsers;
  let totalProducts;
  let totalOrders;

  User.countDocuments() // Đếm tổng số người dùng
    .then((userCount) => {
      totalUsers = userCount;
      return Product.countDocuments(); // Đếm tổng số lượng sản phẩm
    })
    .then((productCount) => {
      totalProducts = productCount;
      return Order.countDocuments(); // Đếm tổng số lượng đơn hàng
    })
    .then((orderCount) => {
      totalOrders = orderCount;
      res.render('admin/index', {
        pageTitle: 'Admin Dashboard',
        path: '/',
        totalUsers: totalUsers,
        totalProducts: totalProducts,
        totalOrders: totalOrders
      });
    })
    .catch((err) => {
      console.error('Error fetching admin dashboard data:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
};




exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.addProduct = (req, res, next) => {
  let title = req.body.title;
  let imageUrl = req.body.imageUrl;
  let price = req.body.price;
  let description = req.body.description;
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user,
  });
  product.save().then((result) => {
    res.redirect("/admin/products");
  });
};
exports.getAdminProducts = (req, res, next) => {
  Product.find({ userId: req.user._id }) // Chỉnh sửa đây, chắc chắn rằng bạn đang sử dụng req.user._id
    .then((products) => {
      console.log(products); // Thêm dòng này để kiểm tra dữ liệu sản phẩm
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin-products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  let prodID = req.params.productID;

  Product.findById(prodID)
    .then((product) => {
      res.render("admin/add-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        product: product,
        editing: true,
      });
    })
    .catch((err) => console.log(err));
};
exports.updateProduct = (req, res, next) => {
  let prodID = req.body.productID;
  let title = req.body.title;
  let imageUrl = req.body.imageUrl;
  let price = req.body.price;
  let description = req.body.description;
  // console.log("hey let me see this :", prodID);
  Product.findById(prodID)
    .then((product) => {
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      product.save();
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
exports.deleteProduct = (req, res, next) => {
  let prodID = req.body.productID;
  Product.findByIdAndDelete(prodID)
    .then((product) => {
      if (!product) {
        console.log("there is no product to destory");
        return new Promise();
      } else {
        console.log("Destroyed product");
        return req.user.deleteCartItemById(prodID);
      }
    })
    .then((_) => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
exports.getAdminOrders = (req, res, next) => {
  Order.find({}) // Lấy tất cả các đơn hàng từ cơ sở dữ liệu
    .then((orders) => {
      res.render("admin/orders", {
        orders: orders,
        pageTitle: "Admin Orders",
        path: "/admin/orders",
      });
    })
    .catch((err) => console.log(err));
};
exports.listUsers = (req, res, next) => {
    // Chỉ cho phép admin truy cập API này
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    // Lấy danh sách người dùng từ cơ sở dữ liệu
    User.find({}, '-password') // Trừ trường password
        .populate('cart.items.productId', 'title') // Populate số lượng sản phẩm trong giỏ hàng
        .exec()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(err => {
            console.error('Error fetching users:', err);
            res.status(500).json({ error: "Internal server error" });
        });
};
exports.getAdminUsers = (req, res, next) => {
  User.find()
      .then(users => {
          res.render('admin/user', {
              pageTitle: 'Admin Users',
              path: '/admin/users',
              users: users
          });
      })
      .catch(err => {
          console.log(err);
      });
};
exports.deleteUser = (req, res, next) => {
  const userID = req.body.userID; // Lấy ID của người dùng từ req.body
  User.findByIdAndDelete(userID) // Tìm và xoá người dùng theo ID
    .then((deletedUser) => {
      if (!deletedUser) { // Nếu không tìm thấy người dùng
        console.log("User not found");
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Deleted user:", deletedUser);
      res.redirect("/admin/users"); // Chuyển hướng sau khi xoá thành công
    })
    .catch((err) => {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Internal server error" }); // Trả về lỗi nếu có lỗi xảy ra
    });
};
