
import { BaseApiService } from '@/shared/services/base-api';
import { AuthService } from './auth-service';
import { DashboardService } from './dashboard-service';
import { UserService } from './user-service';
import { CategoryService } from './category-service';
import { ProductService } from './product-service';
import { OrderService } from './order-service';
import { PaymentService } from './payment-service';
import { PaymentMethodService } from './payment-method-service';
import { StoreService } from './store-service';
import { CompanyService } from './company-service';
import { BillingService } from './billing-service';
import { TransactionService } from './transaction-service';
import { NotificationService } from './notification-service';
import { SubCategoryService } from './subCategory-service';
import { SubSubCategoryService } from './subSubCategory-service';

class ApiService extends BaseApiService {
  private authService = new AuthService();
  private dashboardService = new DashboardService();
  private userService = new UserService();
  private categoryService = new CategoryService();
  private subCategoryService = new SubCategoryService(); 
  private SubSubCategoryService = new SubSubCategoryService();
  private productService = new ProductService();
  private orderService = new OrderService();
  private paymentService = new PaymentService();
  private paymentMethodService = new PaymentMethodService();
  private storeService = new StoreService();
  private companyService = new CompanyService();
  private billingService = new BillingService();
  private transactionService = new TransactionService();
  private notificationService = new NotificationService();

  // Auth methods
  login = this.authService.login.bind(this.authService);
  register = this.authService.register.bind(this.authService);
  verifyOtp = this.authService.verifyOtp.bind(this.authService);
  refreshToken = this.authService.refreshToken.bind(this.authService);
  logout = this.authService.logout.bind(this.authService);

  // Dashboard
  getDashboard = this.dashboardService.getDashboard.bind(this.dashboardService);

  // User Management
  getUsers = this.userService.getUsers.bind(this.userService);
  //updateUserRole = this.userService.updateUserRole.bind(this.userService);
  updateUser = this.userService.updateUser.bind(this.userService);
  //uploadUserImage = this.userService.uploadUserImage.bind(this.userService);
  softDeleteUser = this.userService.softDeleteUser.bind(this.userService);
  hardDeleteUser = this.userService.hardDeleteUser.bind(this.userService);
  unDeleteUser = this.userService.unDeleteUser.bind(this.userService);

  // Category Management
  getCategories = this.categoryService.getCategories.bind(this.categoryService);
  createCategory = this.categoryService.createCategory.bind(this.categoryService);
  updateCategory = this.categoryService.updateCategory.bind(this.categoryService);
  deleteCategory = this.categoryService.deleteCategory.bind(this.categoryService);
  softDeleteCategory = this.categoryService.softDeleteCategory.bind(this.categoryService);
  hardDeleteCategory = this.categoryService.hardDeleteCategory.bind(this.categoryService);
  unDeleteCategory = this.categoryService.unDeleteCategory.bind(this.categoryService);

  // SubCategory Management
  getSubCategories = this.subCategoryService.getSubCategories.bind(this.subCategoryService);
  createSubCategory = this.subCategoryService.createSubCategory.bind(this.subCategoryService);
  updateSubCategory = this.subCategoryService.updateSubCategory.bind(this.subCategoryService);
  deleteSubCategory = this.subCategoryService.deleteSubCategory.bind(this.subCategoryService);
  softDeleteSubCategory = this.subCategoryService.softDeleteSubCategory.bind(this.subCategoryService);
  hardDeleteSubCategory = this.subCategoryService.hardDeleteSubCategory.bind(this.subCategoryService);
  unDeleteSubCategory = this.subCategoryService.unDeleteSubCategory.bind(this.subCategoryService);

  // SubSubCategory Management
  getSubSubCategories = this.SubSubCategoryService.getSubSubCategories.bind(this.SubSubCategoryService);
  createSubSubCategory = this.SubSubCategoryService.createSubSubCategory.bind(this.SubSubCategoryService);
  updateSubSubCategory = this.SubSubCategoryService.updateSubSubCategory.bind(this.SubSubCategoryService);
  deleteSubSubCategory = this.SubSubCategoryService.deleteSubSubCategory.bind(this.SubSubCategoryService);
  softDeleteSubSubCategory = this.SubSubCategoryService.softDeleteSubSubCategory.bind(this.SubSubCategoryService);
  hardDeleteSubSubCategory = this.SubSubCategoryService.hardDeleteSubSubCategory.bind(this.SubSubCategoryService);
  unDeleteSubSubCategory = this.SubSubCategoryService.unDeleteSubSubCategory.bind(this.SubSubCategoryService);

  // Product Management
  getProducts = this.productService.getProducts.bind(this.productService);
  getProductsBySubSubCategoryId = this.productService.getProductsBySubSubCategoryId.bind(this.productService);
  getProductsByCategoryId = this.productService.getProductsByCategoryId.bind(this.productService);
  getProductById = this.productService.getProductById.bind(this.productService);
  createProduct = this.productService.createProduct.bind(this.productService);
  updateProduct = this.productService.updateProduct.bind(this.productService);
  uploadProductImages = this.productService.uploadProductImages.bind(this.productService);
  softDeleteProduct = this.productService.softDeleteProduct.bind(this.productService);
  hardDeleteProduct = this.productService.hardDeleteProduct.bind(this.productService);
  unDeleteProduct = this.productService.unDeleteProduct.bind(this.productService);

  // Order Management
  getOrders = this.orderService.getOrders.bind(this.orderService);
  getAllOrders = this.orderService.getAllOrders.bind(this.orderService);
  getOrderById = this.orderService.getOrderById.bind(this.orderService);
  getOrdersByUserId = this.orderService.getOrdersByUserId.bind(this.orderService);
  confirmOrderStatus = this.orderService.confirmOrderStatus.bind(this.orderService);
  updateOrderStatus = this.orderService.updateOrderStatus.bind(this.orderService);

  // Notification Management
  getAllNotifications = this.notificationService.getAllNotifications.bind(this.notificationService);
  getNotificationsByUserId = this.notificationService.getNotificationsByUserId.bind(this.notificationService);
  markAsRead = this.notificationService.markAsRead.bind(this.notificationService);
  acknowledgeNotification = this.notificationService.acknowledgeNotification.bind(this.notificationService);
  sendNotificationToUser = this.notificationService.sendNotificationToUser.bind(this.notificationService);

  // Payment Method Management
  createPaymentMethod = this.paymentMethodService.createPaymentMethod.bind(this.paymentMethodService);
  getAllPaymentMethods = this.paymentMethodService.getAllPaymentMethods.bind(this.paymentMethodService);
  updatePaymentMethod = this.paymentMethodService.updatePaymentMethod.bind(this.paymentMethodService);
  softDeletePaymentMethod = this.paymentMethodService.softDeletePaymentMethod.bind(this.paymentMethodService);
  unDeletePaymentMethod = this.paymentMethodService.unDeletePaymentMethod.bind(this.paymentMethodService);
  hardDeletePaymentMethod = this.paymentMethodService.hardDeletePaymentMethod.bind(this.paymentMethodService);

  // Legacy Payment Method Management (from payment service)
  getPaymentMethods = this.paymentService.getPaymentMethods.bind(this.paymentService);
  createPaymentMethodLegacy = this.paymentService.createPaymentMethod.bind(this.paymentService);
  updatePaymentMethodLegacy = this.paymentService.updatePaymentMethod.bind(this.paymentService);
  deletePaymentMethod = this.paymentService.deletePaymentMethod.bind(this.paymentService);

  // Store Management
  getStores = this.storeService.getStores.bind(this.storeService);
  createStore = this.storeService.createStore.bind(this.storeService);
  updateStore = this.storeService.updateStore.bind(this.storeService);
  softDeleteStore = this.storeService.softDeleteStore.bind(this.storeService);
  unDeleteStore = this.storeService.unDeleteStore.bind(this.storeService);
  hardDeleteStore = this.storeService.hardDeleteStore.bind(this.storeService);
  
  // Store Address methods
  addStoreAddress = this.storeService.addStoreAddress.bind(this.storeService);
  updateStoreAddress = this.storeService.updateStoreAddress.bind(this.storeService);
  
  // Product Store methods
  createProductStore = this.storeService.createProductStore.bind(this.storeService);
  getAllProductStore = this.storeService.getAllProductStore.bind(this.storeService);
  getProductsByStoreId = this.storeService.getProductsByStoreId.bind(this.storeService);


  // Company Info Management
  getAllCompanyInfo = this.companyService.getAllCompanyInfo.bind(this.companyService);
  createCompanyInfo = this.companyService.createCompanyInfo.bind(this.companyService);
  updateCompanyInfo = this.companyService.updateCompanyInfo.bind(this.companyService);
  uploadCompanyLogo = this.companyService.uploadCompanyLogo.bind(this.companyService);
  hardDeleteCompanyInfo = this.companyService.hardDeleteCompanyInfo.bind(this.companyService);

  // Billing Management
  getBillings = this.billingService.getBillings.bind(this.billingService);
  createBilling = this.billingService.createBilling.bind(this.billingService);
  updateBilling = this.billingService.updateBilling.bind(this.billingService);
  deleteBilling = this.billingService.deleteBilling.bind(this.billingService);

  // Transaction Management (Payment Requests)
  getTransactions = this.transactionService.getTransactions.bind(this.transactionService);
  getTransactionById = this.transactionService.getTransactionById.bind(this.transactionService);
  getPaymentRequests = this.transactionService.getPaymentRequests.bind(this.transactionService);
  getPaymentRequestsByUserId = this.transactionService.getPaymentRequestsByUserId.bind(this.transactionService);
  getPaymentRequestById = this.transactionService.getPaymentRequestById.bind(this.transactionService);
}

export const apiService = new ApiService();
export const BASE_URL = apiService.BASE_URL;
