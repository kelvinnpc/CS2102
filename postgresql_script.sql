DROP TABLE Rates;
DROP TABLE Wallet;
DROP TABLE Uses;
DROP TABLE Cars;
DROP TABLE Bids;
DROP TABLE History;
DROP TABLE Rides;
DROP TABLE Drivers;
DROP TABLE Passengers;
DROP TABLE Users;

CREATE TABLE Users (
	name    varchar(255) NOT NULL,
	username varchar(255) NOT NULL,
	password varchar(255) NOT NULL,
	nric  varchar(9) PRIMARY KEY,
	phonenumber varchar(8) NOT NULL,
	address varchar(255) NOT NULL
);

CREATE TABLE Passengers (
	pid varchar(9) references Users (nric),
	primary key(pid)
);

CREATE TABLE Drivers (
	did varchar(9) references Users (nric),
	primary key (did)
);

CREATE TABLE Rides (
	rid varchar(255) PRIMARY KEY,
	did varchar(9) references Users (nric),
	source varchar(255) NOT NULL,
	destination varchar(255) NOT NULL,
	dates date NOT NULL,
	timing time NOT NULL,
	status varchar(255) NOT NULL
);

CREATE TABLE Rates (
	raterID varchar(9) references Users (nric),
	ratedID varchar(9) references Users (nric),
	rideID varchar(255) references Rides (rid),
	ratings int
);

CREATE TABLE Wallet (
	wid varchar(9) references Passengers (pid),
	balance int NOT NULL,
	primary key (wid)
);

CREATE TABLE Uses (
	timing time NOT NULL,
	pid varchar(9) references Passengers (pid),
	transaction varchar(255),
	primary key (timing, pid)
);

CREATE TABLE Cars (
	did varchar(9),
	platenumber varchar(10),
	model varchar(255),
	numSeats int,
	primary key(did, platenumber)
);

CREATE TABLE Bids (
	pid varchar(9) references Passengers (pid),
	rid varchar (255) references Rides (rid),
	points int NOT NULL,
	primary key (pid, rid)
);

CREATE TABLE History (
	userID varchar(9) references Users (nric),
	rid varchar(255) references Rides (rid)
);

--Insert into Users
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
--Insert into Drivers
INSERT INTO Drivers (did) VALUES 
('S0000001A'),
('S0000004D');

--Insert into Rides
INSERT INTO Rides (rid, did, source, destination, dates, timing, status) VALUES
('0001', 'S0000001A', 'Kent Ridge', 'Buona', '2019-01-29', '13:03:00', 'Pending'),
('0002', 'S0000001A', 'Buona', 'Kent Ridge', '2019-01-31', '17:03:00', 'Pending'),
('0003', 'S0000004D', 'Kent Ridge', 'Buona', '2019-01-31', '13:05:00', 'Pending');