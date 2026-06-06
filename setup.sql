-- ระบบส่งเกียรติบัตร Google AI Professional Certificate
-- โรงเรียนจอมทอง ปีการศึกษา 2569
-- รันไฟล์นี้ใน MariaDB/MySQL เพื่อสร้างฐานข้อมูล

CREATE DATABASE IF NOT EXISTS google_ai_cert
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE google_ai_cert;

-- ตารางข้อมูลครูและบุคลากร
CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(10) DEFAULT NULL,
  position ENUM('ผู้บริหาร','ครู','บุคลากรทางการศึกษา') NOT NULL DEFAULT 'ครู',
  academic_level ENUM('ไม่มีวิทยฐานะ','ชำนาญการ','ชำนาญการพิเศษ') NOT NULL DEFAULT 'ไม่มีวิทยฐานะ',
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_phone (phone),
  INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางเกียรติบัตร (1 แถว = 1 ไฟล์ต่อ 1 หลักสูตร)
CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  course_id TINYINT NOT NULL COMMENT 'หลักสูตรที่ 1-7',
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_teacher_course (teacher_id, course_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
