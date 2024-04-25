// core modules
const express = require("express");

// custom modules
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

// Route cho ql ng dung
router.get("/users", isAuth, adminController.getAdminUsers);
router.post("/delete-user", isAuth, adminController.deleteUser); 
// Route cho trang thêm sản phẩm
router.get("/add-product", isAuth, adminController.getAddProduct);
router.post("/add-product", isAuth, adminController.addProduct);

// Route cho trang hiển thị sản phẩm quản trị
router.get("/products", isAuth, adminController.getAdminProducts);

// Route cho trang chỉnh sửa sản phẩm
router.get("/edit-product/:productID", isAuth, adminController.getEditProduct);
router.post("/edit-product", isAuth, adminController.updateProduct);

// Route cho tác vụ xóa sản phẩm
router.post("/delete-product", isAuth, adminController.deleteProduct);

// Route cho trang quản lí đơn hàng
router.get("/orders", isAuth, adminController.getAdminOrders);

// Route cho trang quản trị chính
router.get("/", isAuth, adminController.getAdminDashboard);
router.get("/api/list-users", isAuth, adminController.listUsers);

module.exports = router;
