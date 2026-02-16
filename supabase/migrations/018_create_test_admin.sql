-- Create test admin user and confirm their email

-- Confirm the email for the test user
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'test.admin@eneccdubai.com';

-- Insert into users table as admin
INSERT INTO users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'test.admin@eneccdubai.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
