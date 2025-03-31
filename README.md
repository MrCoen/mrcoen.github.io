# Topstock Management System (TMS) - https://mrcoen-github-io.onrender.com/

Welcome to the **Topstock Management System (TMS)**, a web-based application designed to streamline inventory management for aisles, bays, and topstocks in retail environments. This system provides an intuitive interface for managing stock, tracking product details, and visualizing data through interactive dashboards.

---

## Features

### 🛠️ Core Functionality
- **Aisle Management**: Add, edit, and delete aisles with associated bays and topstocks.
- **Bay and Topstock Management**: Dynamically manage bays and their topstocks, including product details.
- **Product Tracking**: Track product details such as name, barcode, quantity, expiry date, and department.
- **Interactive Dashboard**: Visualize key metrics like:
  - Total aisles, bays, and topstocks.
  - Closest-to-expiry products.
  - Longest-sitting products.
  - Topstocks usage by department and area.

### 📊 Data Visualization
- **Doughnut Charts**: Display topstock usage (free vs. in-use) and department-wise distribution.
- **Dynamic Area Charts**: Visualize overstocks by area.

### 🔍 Advanced Filtering and Sorting
- Filter products by:
  - Expiration status (expired, not expired).
  - Area (e.g., Building, Paint, Seasonal).
  - Department (e.g., Decor, Showrooms).
- Sort products by date (most recent or oldest).

### 🖥️ Responsive Design
- Fully responsive layout for seamless use on desktops, tablets, and mobile devices.

### Technologies Used
-Backend
   -Node.js: Server-side runtime.
   -Express.js: Web framework for building RESTful APIs.
-Frontend
   -HTML5, CSS3, JavaScript: Core web technologies.
   -Chart.js: For interactive data visualization.
-Data Storage
   -JSON: Used as a lightweight database for storing aisle, bay, and topstock data.

---
mrcoen.github.io/
├── data/
│   └── [aisles.json]                                       # JSON file containing aisle, bay, and topstock data
├── public/
│   ├── assets/                                             # Static assets (CSS, images, etc.)
│   │   ├── css/
│   │   │   ├── [index.css]                                 # Main CSS for the homepage
│   │   │   ├── [dashboard.css]                             # CSS for the dashboard
│   │   └── images/                                         # Icons and images
│   ├── js/
│   │   ├── [script.js]                                     # Main JavaScript for the homepage
│   │   ├── [dashboard.js]                                  # JavaScript for the dashboard
│   ├── [index.html]                                        # Homepage
│   ├── pages/
│   │   └── [dashboard.html]                                # Dashboard page
├── [index.js]                                              # Express server
├── [package.json]                                          # Project dependencies
└── README.md                                               # Project documentation

## License

This project is licensed under the [MIT License](LICENSE).

---

## Developer

Developed by **Dylan Coen **.
