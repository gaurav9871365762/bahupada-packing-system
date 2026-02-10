Bahupada Packing System - MySQL Version
📋 Project Overview
Bahupada Packing System is a complete warehouse/packing management application built with Node.js, Express, and MySQL. The system manages packing tasks, tracks progress, handles supervisor approvals, and maintains complete history records.

🚀 Features
User Authentication & Authorization (Packer, Supervisor, Admin roles)

Packing Task Management with real-time status tracking

Progress Tracking with automatic percentage calculation

Supervisor Approval/Rejection workflow

Dashboard Statistics with comprehensive analytics

Packing History with filter and search capabilities

Role-based Access Control (RBAC)

Search Functionality by challan ID or task ID

RESTful API with proper error handling

🏗️ Tech Stack
Backend: Node.js, Express.js

Database: MySQL

Authentication: JWT (JSON Web Tokens)

Password Hashing: bcryptjs

Validation: express-validator

Environment Management: dotenv

📁 Project Structure
text
bahupada-packing-system/
├── package.json
├── .env
├── server.js
├── config/
│   └── database.js
├── routes/
│   ├── authRoutes.js
│   ├── packingRoutes.js
│   └── dashboardRoutes.js
├── controllers/
│   ├── authController.js
│   ├── packingController.js
│   └── dashboardController.js
├── models/
│   ├── User.js
│   ├── PackingTask.js
│   └── PackingHistory.js
├── middleware/
│   └── authMiddleware.js
└── database/
    ├── init.js
    └── init.sql
🗄️ Database Schema
Users Table
Stores user information with roles (packer, supervisor, admin)

sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('packer', 'supervisor', 'admin') DEFAULT 'packer',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
Packing Tasks Table
Manages all packing tasks with status tracking

sql
CREATE TABLE packing_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id VARCHAR(50) UNIQUE NOT NULL,
  challan_id VARCHAR(50) NOT NULL,
  packer_id INT NOT NULL,
  supervisor_id INT,
  status ENUM('pending', 'in_progress', 'awaiting_supervisor', 'approved', 'rejected') DEFAULT 'pending',
  total_items INT NOT NULL,
  completed_items INT DEFAULT 0,
  progress INT DEFAULT 0,
  task_date DATE NOT NULL,
  due_date DATE,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
Packing History Table
Stores completed task records

sql
CREATE TABLE packing_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id VARCHAR(50) NOT NULL,
  challan_id VARCHAR(50) NOT NULL,
  packer_id INT NOT NULL,
  supervisor_id INT,
  status ENUM('approved', 'rejected') NOT NULL,
  total_items INT NOT NULL,
  completed_items INT NOT NULL,
  completion_date DATE NOT NULL,
  approval_date TIMESTAMP,
  approved_by INT,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Task Items Table
Tracks individual items within tasks

sql
CREATE TABLE task_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id VARCHAR(50) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  packed_quantity INT DEFAULT 0,
  status ENUM('pending', 'packed', 'damaged') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
🔧 Installation & Setup
Prerequisites
Node.js (v14 or higher)

MySQL Server (v5.7 or higher)

npm or yarn
