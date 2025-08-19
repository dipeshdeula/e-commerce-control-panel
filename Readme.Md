# InstantMart E-Commerce Admin Panel

InstantMart Admin Panel is a professional, scalable, and feature-rich dashboard for managing your e-commerce platform. Built with React, Redux Toolkit, TypeScript, and modern UI libraries, it empowers administrators to efficiently manage products, categories, orders, users, notifications, analytics, and more.

---

## 🚀 Features

- **Dashboard & Analytics:** Real-time sales, orders, and user statistics.
- **Product Management:** Add, edit, delete, and update product stock and details.
- **Category Management:** Organize products into categories with easy CRUD operations.
- **Order Management:** Track, update, and manage customer orders and delivery status.
- **User Management:** View, filter, and manage customer and admin accounts.
- **Notifications:** Real-time notifications via SignalR, with unread counts, mark as read, and delete actions.
- **Pagination & Filtering:** Efficient data browsing with server-side pagination, search, and filters.
- **Authentication & Authorization:** Secure login, role-based access, and protected routes.
- **Responsive UI:** Optimized for desktop and mobile devices.
- **Modern UI Components:** Built with reusable components for tables, dialogs, dropdowns, badges, and more.
- **Error Handling & Toasts:** User-friendly feedback for all actions.

---

## 🛠️ Initial Setup

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Backend API running (see backend documentation)

### Installation

```bash
git clone https://github.com/your-org/e-commerce-control-panel.git
cd e-commerce-control-panel
npm install
# or
yarn install
```

### Environment Variables

Create a `.env.local` file in the root directory and configure:

```
REACT_APP_API_BASE_URL=https://localhost:7028
```

### Running the App

```bash
npm start
# or
yarn start
```

The app will run at [http://localhost:3000](http://localhost:3000).

---

## 📦 Project Structure

```
src/
  components/      # Reusable UI components
  pages/           # Main admin pages (Dashboard, Products, Orders, Notifications, etc.)
  store/           # Redux Toolkit slices, API services, and configuration
  hooks/           # Custom React hooks
  services/        # API service classes (e.g., notification-service.ts)
  shared/          # Shared utilities and types
  assets/          # Images and static files
```

---

## 🔔 Notifications System

- Real-time updates via SignalR.
- Redux-powered global state for notifications.
- Mark as read, mark all as read, delete, and view details.
- Unread count badge in top bar.
- Infinite scroll and pagination in dropdown and notifications page.

---

## 🧑‍💼 Admin Features

- **Categories:** Add, edit, delete, and paginate categories.
- **Products:** Full CRUD, stock management, and filtering.
- **Orders:** View, update status, and filter orders.
- **Users:** Manage user accounts and roles.
- **Notifications:** View, filter, and manage notifications.

---

## 🧩 Tech Stack

- **React** (with hooks)
- **Redux Toolkit** (global state management)
- **TypeScript** (type safety)
- **SignalR** (real-time notifications)
- **Tailwind CSS** (styling)
- **Lucide Icons** (iconography)
- **React Query** (data fetching and caching)
- **Vite** or **CRA** (bundler, depending on setup)

---

## 📝 Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💬 Support

For questions, issues, or feature requests, please open an issue or contact the maintainer.

---

**InstantMart Admin Panel – Modern, scalable, and ready for your e-commerce business!**