-- This file is used to initialize the database in PostgreSQL

-- Create User table
CREATE TYPE user_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS "user" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" user_role NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create CoWorking table
CREATE TABLE IF NOT EXISTS "coworking" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "open_time" TIME NOT NULL,  -- Might need to change
    "close_time" TIME NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Room table
CREATE TABLE IF NOT EXISTS "room" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "capacity" INT NOT NULL,
    "price"INT NOT NULL,
    "coworking_id" INT NOT NULL REFERENCES "coworking"("id"),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Reservation table
CREATE TABLE IF NOT EXISTS "reservation" (
    "id" SERIAL PRIMARY KEY,
    "owner_id" INT NOT NULL REFERENCES "user"("id"),
    "room_id" INT NOT NULL REFERENCES "room"("id"),
    "start_at" TIMESTAMP NOT NULL,
    "end_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Participant table
CREATE TABLE IF NOT EXISTS "participant" (
    "reservation_id" INT NOT NULL REFERENCES "reservation"("id"),
    "user_id" INT NOT NULL REFERENCES "user"("id"),
    PRIMARY KEY ("reservation_id", "user_id")
);

-- Create Invitation table
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE IF NOT EXISTS "invitation" (
    "reservation_id" INT NOT NULL REFERENCES "reservation"("id"),
    "invitee_id" INT NOT NULL REFERENCES "user"("id"),
    "inviter_id" INT NOT NULL REFERENCES "user"("id"),
    "status" invitation_status NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("reservation_id", "invitee_id")
);

-- Create Bookmark table
CREATE TABLE IF NOT EXISTS "bookmark" (
    "user_id" INT NOT NULL REFERENCES "user"("id"),
    "room_id" INT NOT NULL REFERENCES "room"("id"),
    PRIMARY KEY ("user_id", "room_id")
);