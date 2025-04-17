-- Note: the password is hashed with JWT secret which is provided in the `config.example.env`

-- Insert Admins
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

-- Insert Users
INSERT INTO "user" (name, phone, email, password, role)
VALUES ('user2', 
        '+66 922222222', 
        'user2@gmail.com', 
        '$2b$10$qd2rZFR481eaiHmj.QY87.1/kBwjZLuAuUBwndBfZt14U7EwIxhXm', 
        'user');


INSERT INTO "user" (name, phone, email, password, role)
VALUES ('user3', 
        '+66 933333333', 
        'user3@gmail.com', 
        '$2b$10$Pz4BzAv/oGpuebtbjjWzBOTsmw6wWVaOfNHDYH/fCn8abRZXe92jK', 
        'user');

INSERT INTO "user" (name, phone, email, password, role)
VALUES ('user4', 
        '+66 944444444', 
        'user4@gmail.com', 
        '$2b$10$4drTk0goe.3nhUW4E1yjU.MyEWH6clnM/nz1Izn3iHXEeaxk5JtoW', 
        'user');