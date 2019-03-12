DROP TABLE Users;
CREATE TABLE Users (
	name    varchar(255) NOT NULL,
	username varchar(255) NOT NULL,
	password varchar(255) NOT NULL,
	nric  varchar(9) PRIMARY KEY,
	phonenumber varchar(8) NOT NULL
);

INSERT INTO Users (name, username, password, nric, phonenumber)
VALUES ('Leslie Cole', 'LeslieCole', 'password1', 'S0000001A', '12345678');

INSERT INTO Users (name, username, password, nric, phonenumber)
VALUES ('Myra Morgan', 'MyraMorgan', 'password1','S0000002B', '12345677');

INSERT INTO Users (name, username, password, nric, phonenumber)
VALUES ('Raymond Benson', 'RaymondBenson', 'password1', 'S0000003C', '12345676');

INSERT INTO Users (name, username, password, nric, phonenumber)
VALUES ('Wendy Kelley', 'WendyKelley', 'password1', 'S0000004D', '12345675');

INSERT INTO Users (name, username, password, nric, phonenumber)
VALUES ('Patrick Bowers', 'PatrickBowers', 'password1', 'S0000005E', '12345674');

INSERT INTO Users (name, username, password, nric, phonenumber)
VALUES ('Ralph Hogan', 'RalphHogan', 'password1', 'S0000006F', '12345673');

INSERT INTO Users (name, username, password, nric, phonenumber)
VALUES ('Cecil Rodriquez', 'CecilRodriquez', 'password1', 'S0000007G', '12345672');

INSERT INTO Users (name, username, password, nric, phonenumber)
VALUES ('Delia Ferguson', 'DeliaFerguson', 'password1', 'S0000008H', '12345671');

INSERT INTO Users (name, username, password, nric, phonenumber)
VALUES ('Frances Wright', 'FrancesWright', 'password1', 'S0000009I', '12345670');

INSERT INTO Users (name, username, password, nric, phonenumber)
VALUES ('Alyssa Sims', 'AlyssaSims', 'password1', 'S0000010J', '12345681');