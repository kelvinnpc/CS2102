DROP TABLE Users;
CREATE TABLE Users (
	name    varchar(255) NOT NULL,
	username varchar(255) NOT NULL,
	password varchar(255) NOT NULL,
	nric  varchar(9) PRIMARY KEY,
	phonenumber varchar(8) NOT NULL,
	address varchar(255) NOT NULL
);

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Leslie Cole', 'LeslieCole', 'password1', 'S0000001A', '12345678', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Myra Morgan', 'MyraMorgan', 'password1','S0000002B', '12345677', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Raymond Benson', 'RaymondBenson', 'password1', 'S0000003C', '12345676', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Wendy Kelley', 'WendyKelley', 'password1', 'S0000004D', '12345675', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Patrick Bowers', 'PatrickBowers', 'password1', 'S0000005E', '12345674', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Ralph Hogan', 'RalphHogan', 'password1', 'S0000006F', '12345673', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Cecil Rodriquez', 'CecilRodriquez', 'password1', 'S0000007G', '12345672', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Delia Ferguson', 'DeliaFerguson', 'password1', 'S0000008H', '12345671', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Frances Wright', 'FrancesWright', 'password1', 'S0000009I', '12345670', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Alyssa Sims', 'AlyssaSims', 'password1', 'S0000010J', '12345681', 'Kent Ridge');