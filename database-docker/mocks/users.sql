-- Add Admin
-- Note: the password is hashed with JWT secret which is provided in the `config.example.env`
INSERT INTO "user" (name, phone, email, password, role)
VALUES ('admin1', 
        '+66 912345678', 
        'admin1@gmail.com', 
        '$2b$10$Z3YPCsGRsoZpR0JnsST48eKQTuBWI8j01ghTZ47JT7VqmRX5ypJg.', 
        'admin');

INSERT INTO "user" (name, phone, email, password, role)
VALUES ('admin2', 
        '+66 987654321', 
        'admin2@gmail.com', 
        '$2b$10$1a5XeF/avgxU7Jm/N3fNRuX7qtnMfkoTwrAIm//tGwT3idT5ve4a6', 
        'admin');