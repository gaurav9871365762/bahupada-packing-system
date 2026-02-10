-- Create database
CREATE DATABASE IF NOT EXISTS bahupada_packing;
USE bahupada_packing;

-- Users table (packers, supervisors, admins)
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

-- Packing tasks table
CREATE TABLE packing_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id VARCHAR(50) UNIQUE NOT NULL,
  challan_id VARCHAR(50) NOT NULL,
  packer_id INT NOT NULL,
  supervisor_id INT,
  status ENUM('pending', 'in_progress', 'awaiting_supervisor', 'approved', 'rejected') DEFAULT 'pending',
  total_items INT NOT NULL,
  completed_items INT DEFAULT 0,
  progress INT DEFAULT 0, -- percentage
  task_date DATE NOT NULL,
  due_date DATE,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (packer_id) REFERENCES users(id),
  FOREIGN KEY (supervisor_id) REFERENCES users(id)
);

-- Packing history table
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (packer_id) REFERENCES users(id),
  FOREIGN KEY (supervisor_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Task items table
CREATE TABLE task_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id VARCHAR(50) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  packed_quantity INT DEFAULT 0,
  status ENUM('pending', 'packed', 'damaged') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES packing_tasks(task_id) ON DELETE CASCADE
);

-- Insert sample users
INSERT INTO users (employee_id, name, email, password, role) VALUES
('EMP001', 'Ramesh Patel', 'ramesh.patel@bahupada.com', '$2a$10$YourHashedPasswordHere', 'packer'),
('EMP002', 'Suresh Verma', 'suresh.verma@bahupada.com', '$2a$10$YourHashedPasswordHere', 'supervisor'),
('EMP003', 'Admin User', 'admin@bahupada.com', '$2a$10$YourHashedPasswordHere', 'admin');

-- Insert sample packing tasks
INSERT INTO packing_tasks (task_id, challan_id, packer_id, status, total_items, completed_items, progress, task_date) VALUES
('PCK001', 'CH-778', 1, 'pending', 30, 28, 93, '2025-01-15'),
('PCK002', 'CH-779', 1, 'awaiting_supervisor', 30, 28, 93, '2025-01-15'),
('PCK003', 'CH-780', 1, 'approved', 30, 30, 100, '2025-01-15'),
('PCK004', 'CH-781', 1, 'pending', 30, 28, 93, '2025-01-15'),
('PCK005', 'CH-782', 1, 'pending', 30, 28, 93, '2025-01-15'),
('PCK006', 'CH-783', 1, 'rejected', 30, 30, 100, '2025-01-15'),
('PCK007', 'CH-784', 1, 'approved', 30, 30, 100, '2025-01-15'),
('PCK008', 'CH-785', 1, 'awaiting_supervisor', 30, 28, 93, '2025-01-15'),
('PCK009', 'CH-786', 1, 'approved', 30, 30, 100, '2025-01-15'),
('PCK010', 'CH-787', 1, 'pending', 30, 28, 93, '2025-01-15');

-- Insert sample packing history
INSERT INTO packing_history (task_id, challan_id, packer_id, supervisor_id, status, total_items, completed_items, completion_date, approval_date, approved_by, rejection_reason) VALUES
('PCK003', 'CH-780', 1, 2, 'approved', 2, 2, '2025-01-14', '2025-01-14 16:45:00', 2, NULL),
('PCK006', 'CH-783', 1, 2, 'rejected', 2, 2, '2025-01-14', NULL, NULL, 'Damaged packaging on 3 coffee packets'),
('PCK007', 'CH-784', 1, 2, 'approved', 2, 2, '2025-01-13', '2025-01-13 15:15:00', 2, NULL),
('PCK009', 'CH-786', 1, 2, 'approved', 2, 2, '2025-01-12', '2025-01-12 14:15:00', 2, NULL);