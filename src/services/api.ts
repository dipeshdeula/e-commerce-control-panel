
import { BaseApiService } from '@/shared/services/base-api';
import { AuthService } from './auth-service';
import { DashboardService } from './dashboard-service';
import { UserService } from './user-service';
import { CategoryService } from './category-service';
import { ProductService } from './product-service';
import { OrderService } from './order-service';
import { PaymentService } from './payment-service';
import { StoreService } from './store-service';
import { CompanyService } from './company-service';
import { BillingService } from './billing-service';
import { TransactionService } from './transaction-service';

class ApiService extends BaseApiService {
  private authService = new AuthService();
  private dashboardService = new DashboardService();
  private userService = new UserService();
  private categoryService = new CategoryService();
  private productService = new ProductService();
  private orderService = new OrderService();
  private paymentService = new PaymentService();
  private storeService = new StoreService();
  private companyService = new CompanyService();
  private billingService = new BillingService();
  private transactionService = new TransactionService();

  // Auth methods
  login = this.authService.login.bind(this.authService);
  register = this.authService.register.bind(this.authService);
  verifyOtp = this.authService.verifyOtp.bind(this.authService);

  // Dashboard
  getDashboard = this.dashboardService.getDashboard.bind(this.dashboardService);

  // User Management
  getUsers = this.userService.getUsers.bind(this.userService);
  updateUserRole = this.userService.updateUserRole.bind(this.userService);
  updateUser = this.userService.updateUser.bind(this.userService);
  uploadUserImage = this.userService.uploadUserImage.bind(this.userService);
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
  getSubCategories = this.categoryService.getSubCategories.bind(this.categoryService);
  createSubCategory = this.categoryService.createSubCategory.bind(this.categoryService);
  updateSubCategory = this.categoryService.updateSubCategory.bind(this.categoryService);
  deleteSubCategory = this.categoryService.deleteSubCategory.bind(this.categoryService);
  softDeleteSubCategory = this.categoryService.softDeleteSubCategory.bind(this.categoryService);
  hardDeleteSubCategory = this.categoryService.hardDeleteSubCategory.bind(this.categoryService);
  unDeleteSubCategory = this.categoryService.unDeleteSubCategory.bind(this.categoryService);

  // SubSubCategory Management
  getSubSubCategories = this.categoryService.getSubSubCategories.bind(this.categoryService);
  createSubSubCategory = this.categoryService.createSubSubCategory.bind(this.categoryService);
  updateSubSubCategory = this.categoryService.updateSubSubCategory.bind(this.categoryService);
  deleteSubSubCategory = this.categoryService.deleteSubSubCategory.bind(this.categoryService);
  softDeleteSubSubCategory = this.categoryService.softDeleteSubSubCategory.bind(this.categoryService);
  hardDeleteSubSubCategory = this.categoryService.hardDeleteSubSubCategory.bind(this.categoryService);
  unDeleteSubSubCategory = this.categoryService.unDeleteSubSubCategory.bind(this.categoryService);

  // Product Management
  getProducts = this.productService.getProducts.bind(this.productService);
  createProduct = this.productService.createProduct.bind(this.productService);
  updateProduct = this.productService.updateProduct.bind(this.productService);
  deleteProduct = this.productService.deleteProduct.bind(this.productService);
  softDeleteProduct = this.productService.softDeleteProduct.bind(this.productService);
  hardDeleteProduct = this.productService.hardDeleteProduct.bind(this.productService);

  // Order Management
  getOrders = this.orderService.getOrders.bind(this.orderService);
  updateOrderStatus = this.orderService.updateOrderStatus.bind(this.orderService);

  // Payment Method Management
  getPaymentMethods = this.paymentService.getPaymentMethods.bind(this.paymentService);
  createPaymentMethod = this.paymentService.createPaymentMethod.bind(this.paymentService);
  updatePaymentMethod = this.paymentService.updatePaymentMethod.bind(this.paymentService);
  deletePaymentMethod = this.paymentService.deletePaymentMethod.bind(this.paymentService);

  // Payment Request Management
  getPaymentRequests = this.paymentService.getPaymentRequests.bind(this.paymentService);
  createPaymentRequest = this.paymentService.createPaymentRequest.bind(this.paymentService);
  updatePaymentRequest = this.paymentService.updatePaymentRequest.bind(this.paymentService);
  deletePaymentRequest = this.paymentService.deletePaymentRequest.bind(this.paymentService);

  // Store Management
  getStores = this.storeService.getStores.bind(this.storeService);

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

  // Transaction Management
  getTransactions = this.transactionService.getTransactions.bind(this.transactionService);
  getTransactionById = this.transactionService.getTransactionById.bind(this.transactionService);
  createTransaction = this.transactionService.createTransaction.bind(this.transactionService);
  updateTransaction = this.transactionService.updateTransaction.bind(this.transactionService);
  deleteTransaction = this.transactionService.deleteTransaction.bind(this.transactionService);
  updateTransactionStatus = this.transactionService.updateTransactionStatus.bind(this.transactionService);
}

export const apiService = new ApiService();
export const BASE_URL = apiService.BASE_URL;
