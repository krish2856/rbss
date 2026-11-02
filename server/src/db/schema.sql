-- Rajgor Brahmin Samaj PostgreSQL Production Schema
-- Designed for Neon PostgreSQL and local PostgreSQL

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS committee_members CASCADE;
DROP TABLE IF EXISTS temple_directory CASCADE;
DROP TABLE IF EXISTS education_careers CASCADE;
DROP TABLE IF EXISTS blood_donors CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS funds CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS event_rsvps CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS matrimony_interests CASCADE;
DROP TABLE IF EXISTS matrimony_profiles CASCADE;
DROP TABLE IF EXISTS family_details CASCADE;
DROP TABLE IF EXISTS member_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) DEFAULT 'member' CHECK (role IN ('super_admin', 'president', 'secretary', 'treasurer', 'committee', 'member')),
  is_approved BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  otp_code VARCHAR(10),
  otp_expires_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- 2. Member Profiles Table
CREATE TABLE member_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  father_name VARCHAR(150),
  surname VARCHAR(100) NOT NULL,
  gotra VARCHAR(100) NOT NULL,
  kuldevi VARCHAR(150) NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  dob DATE,
  marital_status VARCHAR(30) DEFAULT 'single',
  native_village VARCHAR(100) NOT NULL,
  native_taluka VARCHAR(100),
  current_city VARCHAR(100) NOT NULL,
  state VARCHAR(100) DEFAULT 'Gujarat',
  country VARCHAR(100) DEFAULT 'India',
  education VARCHAR(150),
  occupation VARCHAR(150),
  company_or_business VARCHAR(200),
  blood_group VARCHAR(10),
  photo_url TEXT,
  phone_visible BOOLEAN DEFAULT TRUE,
  address TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_surname ON member_profiles(surname);
CREATE INDEX idx_profiles_city ON member_profiles(current_city);
CREATE INDEX idx_profiles_village ON member_profiles(native_village);
CREATE INDEX idx_profiles_gotra ON member_profiles(gotra);

-- 3. Family Details
CREATE TABLE family_details (
  id VARCHAR(64) PRIMARY KEY,
  member_id VARCHAR(64) NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  relation VARCHAR(50) NOT NULL,
  age INT,
  education VARCHAR(100),
  occupation VARCHAR(100),
  marital_status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Matrimony Profiles Table
CREATE TABLE matrimony_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id VARCHAR(64) UNIQUE NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  height_cm INT,
  weight_kg INT,
  complexion VARCHAR(50),
  rashi VARCHAR(50),
  nakshatra VARCHAR(50),
  manglik VARCHAR(30) DEFAULT 'no',
  diet VARCHAR(30) DEFAULT 'pure_vegetarian',
  annual_income VARCHAR(50),
  partner_expectations TEXT,
  hobbies TEXT,
  biodata_pdf_url TEXT,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Matrimony Interests Table
CREATE TABLE matrimony_interests (
  id VARCHAR(64) PRIMARY KEY,
  sender_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  note TEXT,
  contact_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_interest UNIQUE (sender_user_id, receiver_user_id)
);

-- 6. Events Table
CREATE TABLE events (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  title_gu VARCHAR(250),
  description TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'cultural',
  venue_name VARCHAR(250) NOT NULL,
  address TEXT,
  city VARCHAR(100) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  banner_url TEXT,
  max_attendees INT DEFAULT 500,
  registration_open BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(64) REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Event RSVPs
CREATE TABLE event_rsvps (
  id VARCHAR(64) PRIMARY KEY,
  event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_count INT DEFAULT 1,
  notes TEXT,
  status VARCHAR(30) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_event_rsvp UNIQUE (event_id, user_id)
);

-- 8. Announcements Table
CREATE TABLE announcements (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(250) NOT NULL,
  title_gu VARCHAR(250),
  category VARCHAR(50) NOT NULL CHECK (category IN ('notice', 'urgent', 'birthday', 'wedding', 'condolence', 'achievement', 'general')),
  content TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(64) REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Funds
CREATE TABLE funds (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  name_gu VARCHAR(150),
  description TEXT,
  target_amount NUMERIC(12, 2) DEFAULT 0,
  collected_amount NUMERIC(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 10. Donations Table
CREATE TABLE donations (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  fund_type VARCHAR(50) NOT NULL REFERENCES funds(id),
  donor_name VARCHAR(150) NOT NULL,
  donor_phone VARCHAR(20) NOT NULL,
  donor_pan VARCHAR(20),
  amount NUMERIC(12, 2) NOT NULL,
  payment_mode VARCHAR(50) DEFAULT 'UPI',
  transaction_ref VARCHAR(100),
  payment_status VARCHAR(30) DEFAULT 'completed',
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Expenses Table
CREATE TABLE expenses (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL,
  bill_url TEXT,
  approved_by VARCHAR(64) REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Businesses Table
CREATE TABLE businesses (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  address TEXT,
  city VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  website TEXT,
  instagram TEXT,
  logo_url TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Blood Donors Table
CREATE TABLE blood_donors (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  blood_group VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  last_donated_date DATE,
  emergency_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Education & Careers Table
CREATE TABLE education_careers (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(30) NOT NULL CHECK (type IN ('scholarship', 'job', 'internship', 'guidance', 'achievement')),
  title VARCHAR(200) NOT NULL,
  organization VARCHAR(150),
  description TEXT NOT NULL,
  eligibility TEXT,
  apply_link TEXT,
  contact_info VARCHAR(150),
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Temple & Kuldevi Directory Table
CREATE TABLE temple_directory (
  id VARCHAR(64) PRIMARY KEY,
  temple_name VARCHAR(200) NOT NULL,
  temple_name_gu VARCHAR(200),
  deity_name VARCHAR(150) NOT NULL,
  deity_name_gu VARCHAR(150),
  location VARCHAR(200) NOT NULL,
  description TEXT,
  history TEXT,
  photo_url TEXT,
  contact_phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Committee Members Table
CREATE TABLE committee_members (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  designation_gu VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  photo_url TEXT,
  term_years VARCHAR(50) DEFAULT '2024-2027',
  priority_order INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Audit Logs Table
CREATE TABLE audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  admin_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
