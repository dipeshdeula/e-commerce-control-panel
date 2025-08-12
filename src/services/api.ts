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
import { BannerEventService } from './banner-event-service';
import { TransactionService } from './transaction-service';
import { NotificationService } from './notification-service';
import { SubCategoryService } from './subCategory-service';
import { SubSubCategoryService } from './subSubCategory-service';
import { DeliveryService } from './delivery-service';
import { PromoCodeService } from './promo-code-service';
import { ShippingService } from './shipping-service';

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
  private bannerEventService = new BannerEventService();
  private transactionService = new TransactionService();
  private notificationService = new NotificationService();
  private deliveryService = new DeliveryService();
  private promoCodeService = new PromoCodeService();
  private shippingService = new ShippingService();

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
  getUserById = this.userService.getUserById.bind(this.userService);
  //updateUserRole = this.userService.updateUserRole.bind(this.userService);
  updateUser = this.userService.updateUser.bind(this.userService);
  updateUserRole = this.userService.updateUserRole.bind(this.userService);
  uploadUserImage = this.userService.uploadUserImage.bind(this.userService);
  addUserAddress = this.userService.addUserAddress.bind(this.userService);
  updateUserAddress = this.userService.updateUserAddress.bind(this.userService);
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
  getAllProductsAdmin = this.productService.getAllProductsAdmin.bind(this.productService);
  getProductsWithDynamicPricing = this.productService.getProductsWithDynamicPricing.bind(this.productService);
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
  softDeleteOrder = this.orderService.softDeleteOrder.bind(this.orderService);
  unDeleteOrder = this.orderService.unDeleteOrder.bind(this.orderService);
  hardDeleteOrder = this.orderService.hardDeleteOrder.bind(this.orderService);

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
  getCompanyInfoById = this.companyService.getCompanyInfoById.bind(this.companyService);
  createCompanyInfo = this.companyService.createCompanyInfo.bind(this.companyService);
  updateCompanyInfo = this.companyService.updateCompanyInfo.bind(this.companyService);
  uploadCompanyLogo = this.companyService.uploadCompanyLogo.bind(this.companyService);
  softDeleteCompanyInfo = this.companyService.softDeleteCompanyInfo.bind(this.companyService);
  unDeleteCompanyInfo = this.companyService.unDeleteCompanyInfo.bind(this.companyService);
  hardDeleteCompanyInfo = this.companyService.hardDeleteCompanyInfo.bind(this.companyService);

  // Billing Management
  getAllBills = this.billingService.getAllBills.bind(this.billingService);
  getAllBillItems = this.billingService.getAllBillItems.bind(this.billingService);
  getBillByUserId = this.billingService.getBillByUserId.bind(this.billingService);
  softDeleteBill = this.billingService.softDeleteBill.bind(this.billingService);
  unDeleteBill = this.billingService.unDeleteBill.bind(this.billingService);
  hardDeleteBill = this.billingService.hardDeleteBill.bind(this.billingService);

  // Banner Event Management
  getAllBannerEvents = this.bannerEventService.getAllBannerEvents.bind(this.bannerEventService);
  getBannerEventById = this.bannerEventService.getBannerEventById.bind(this.bannerEventService);
  createBannerEvent = this.bannerEventService.createBannerEvent.bind(this.bannerEventService);
  uploadBannerImages = this.bannerEventService.uploadBannerImages.bind(this.bannerEventService);
  activateOrDeactivateBannerEvent = this.bannerEventService.activateOrDeactivateBannerEvent.bind(this.bannerEventService);
  softDeleteBannerEvent = this.bannerEventService.softDeleteBannerEvent.bind(this.bannerEventService);
  unDeleteBannerEvent = this.bannerEventService.unDeleteBannerEvent.bind(this.bannerEventService);
  hardDeleteBannerEvent = this.bannerEventService.hardDeleteBannerEvent.bind(this.bannerEventService);
  getEventAnalytics = this.bannerEventService.getEventAnalytics.bind(this.bannerEventService);
  getTopPerformingEvents = this.bannerEventService.getTopPerformingEvents.bind(this.bannerEventService);
  getDiscountSummary = this.bannerEventService.getDiscountSummary.bind(this.bannerEventService);
  getRealTimeData = this.bannerEventService.getRealTimeData.bind(this.bannerEventService);
  getRuleReport = this.bannerEventService.getRuleReport.bind(this.bannerEventService);

  // Transaction Management (Payment Requests)
  getTransactions = this.transactionService.getTransactions.bind(this.transactionService);
  getTransactionById = this.transactionService.getTransactionById.bind(this.transactionService);
  getPaymentRequests = this.transactionService.getPaymentRequests.bind(this.transactionService);
  getPaymentRequestsByUserId = this.transactionService.getPaymentRequestsByUserId.bind(this.transactionService);
  getPaymentRequestById = this.transactionService.getPaymentRequestById.bind(this.transactionService);
  softDeletePaymentRequest = this.transactionService.softDeletePaymentRequest.bind(this.transactionService);
  unDeletePaymentRequest = this.transactionService.unDeletePaymentRequest.bind(this.transactionService);
  hardDeletePaymentRequest = this.transactionService.hardDeletePaymentRequest.bind(this.transactionService);

  // Delivery Management
  markOrderAsDelivered = this.deliveryService.markOrderAsDelivered.bind(this.deliveryService);
  collectCODPayment = this.deliveryService.collectCODPayment.bind(this.deliveryService);
  getPendingDeliveries = this.deliveryService.getPendingDeliveries.bind(this.deliveryService);
  getCompletedDeliveries = this.deliveryService.getCompletedDeliveries.bind(this.deliveryService);
  getDeliveryStats = this.deliveryService.getDeliveryStats.bind(this.deliveryService);
  getDeliveryPersons = this.deliveryService.getDeliveryPersons.bind(this.deliveryService);
  updateDeliveryStatus = this.deliveryService.updateDeliveryStatus.bind(this.deliveryService);
  assignDelivery = this.deliveryService.assignDelivery.bind(this.deliveryService);
  getDeliveryHistory = this.deliveryService.getDeliveryHistory.bind(this.deliveryService);

  // Promo Code Management
  createPromoCode = this.promoCodeService.createPromoCode.bind(this.promoCodeService);
  updatePromoCode = this.promoCodeService.updatePromoCode.bind(this.promoCodeService);
  activatePromoCode = this.promoCodeService.activatePromoCode.bind(this.promoCodeService);
  deactivatePromoCode = this.promoCodeService.deactivatePromoCode.bind(this.promoCodeService);
  softDeletePromoCode = this.promoCodeService.softDeletePromoCode.bind(this.promoCodeService);
  unDeletePromoCode = this.promoCodeService.unDeletePromoCode.bind(this.promoCodeService);
  hardDeletePromoCode = this.promoCodeService.hardDeletePromoCode.bind(this.promoCodeService);
  getAllPromoCodes = this.promoCodeService.getAllPromoCodes.bind(this.promoCodeService);

  // Shipping Management
  createShippingConfiguration = this.shippingService.createShippingConfiguration.bind(this.shippingService);
  updateShippingConfiguration = this.shippingService.updateShippingConfiguration.bind(this.shippingService);
  setDefaultShippingConfiguration = this.shippingService.setDefaultShippingConfiguration.bind(this.shippingService);
  softDeleteShippingConfiguration = this.shippingService.softDeleteShippingConfiguration.bind(this.shippingService);
  hardDeleteShippingConfiguration = this.shippingService.hardDeleteShippingConfiguration.bind(this.shippingService);
  getAllShippingConfigurations = this.shippingService.getAllShippingConfigurations.bind(this.shippingService);
}

export const apiService = new ApiService();
export const BASE_URL = apiService.BASE_URL;
