-- NovaCare Database Schema
-- Run this script in Oracle SQL Developer to create the necessary tables

-- Create DOCTORS table
CREATE TABLE DOCTORS (
    DOCTOR_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    FIRST_NAME VARCHAR2(100) NOT NULL,
    LAST_NAME VARCHAR2(100) NOT NULL,
    SPECIALIZATION VARCHAR2(100) NOT NULL,
    EMAIL VARCHAR2(255) NOT NULL UNIQUE,
    PHONE VARCHAR2(20) NOT NULL,
    LICENSE_NUMBER VARCHAR2(50) NOT NULL UNIQUE,
    DEPARTMENT VARCHAR2(100) NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_doctors_email ON DOCTORS(EMAIL);

-- Create index on license number
CREATE INDEX idx_doctors_license ON DOCTORS(LICENSE_NUMBER);

-- Sample data (optional)
INSERT INTO DOCTORS (FIRST_NAME, LAST_NAME, SPECIALIZATION, EMAIL, PHONE, LICENSE_NUMBER, DEPARTMENT)
VALUES ('Sarah', 'Johnson', 'Cardiology', 'sarah.johnson@novacare.com', '+1234567890', 'MD-001234', 'Cardiology Department');

INSERT INTO DOCTORS (FIRST_NAME, LAST_NAME, SPECIALIZATION, EMAIL, PHONE, LICENSE_NUMBER, DEPARTMENT)
VALUES ('Michael', 'Chen', 'Pediatrics', 'michael.chen@novacare.com', '+1234567891', 'MD-001235', 'Pediatrics Department');

INSERT INTO DOCTORS (FIRST_NAME, LAST_NAME, SPECIALIZATION, EMAIL, PHONE, LICENSE_NUMBER, DEPARTMENT)
VALUES ('Emily', 'Rodriguez', 'General Practice', 'emily.rodriguez@novacare.com', '+1234567892', 'MD-001236', 'General Practice');

COMMIT;

-- Verify the table was created
SELECT * FROM DOCTORS;
