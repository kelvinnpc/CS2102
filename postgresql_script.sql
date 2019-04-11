DROP TABLE IF EXISTS Uses;
DROP TABLE IF EXISTS AccessHelpDesk;
DROP TABLE IF EXISTS History;
DROP TABLE IF EXISTS Cars;
DROP TABLE IF EXISTS Bids;
DROP TABLE IF EXISTS Wallet;
DROP TABLE IF EXISTS Rates;
DROP TABLE IF EXISTS Rides;
DROP TABLE IF EXISTS Drivers;
DROP TABLE IF EXISTS Passengers;
DROP TABLE IF EXISTS Users;
DROP TRIGGER IF EXISTS rideCheck on Rides;
DROP TRIGGER IF EXISTS transactionUpdate on Uses;
DROP TRIGGER IF EXISTS updateRideCheck on Rides;
DROP TRIGGER IF EXISTS insertBidCheck on Bids;
DROP TRIGGER IF EXISTS newUserInit on Users;
DROP TRIGGER IF EXISTS topUpCheck on Uses;
DROP FUNCTION IF EXISTS topUpCheck;

CREATE TABLE Users (
	name    varchar(255) NOT NULL,
	username varchar(255) unique NOT NULL,
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
	rid SERIAL PRIMARY KEY,
	did varchar(9) references Drivers (did),
	source varchar(255) NOT NULL,
	destination varchar(255) NOT NULL,
	numSeats integer,
	status varchar(20) default 'open', /* 2 status 'open' and 'close' */
	date timestamp
);

CREATE TABLE Rates (
	raterID varchar(9) references Users (nric),
	ratedID varchar(9) references Users (nric),
	ratings int,
	rid int references Rides (rid),
	PRIMARY KEY (raterID, ratedID, rid)
);

CREATE TABLE Wallet (
	wid varchar(9) references Users (nric),
	balance int NOT NULL,
	primary key (wid)
);

CREATE TABLE Uses (
	pid varchar(9) references Users (nric),
	transaction integer,
	date timestamp default current_timestamp,
	primary key (date, pid)
);

CREATE TABLE Cars (
	did varchar(9) references Drivers (did),
	platenumber varchar(10),
	model varchar(255),
	numSeats int,
	primary key(did, platenumber)
);

CREATE TABLE Bids (
	pid varchar(9) references Passengers (pid),
	rid integer references Rides (rid),
	points int NOT NULL,
	status varchar(20) default 'pending', /* 3 status 'pending', 'rejected', 'Ride Confirmed' */
	primary key (pid, rid)
);

CREATE TABLE History (
	userID varchar(9) references Passengers (pid),
	rid integer references Rides (rid),
	points integer
);

create table AccessHelpDesk (
	msgID SERIAL PRIMARY KEY,
    userID varchar(9) references Users (nric),
    message varchar(1000),
    date timestamp default current_timestamp
);

CREATE OR REPLACE FUNCTION rideCheck()
RETURNS trigger AS
$$
DECLARE seatLimit integer;
BEGIN
	SELECT numSeats INTO seatLimit FROM Cars C where C.did=NEW.did;
	IF (NEW.numSeats > seatLimit) THEN RAISE EXCEPTION 'too many seats indicated'; RETURN NULL;
	END IF;
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER rideCheck
BEFORE INSERT ON Rides
FOR EACH ROW
EXECUTE PROCEDURE rideCheck();


CREATE OR REPLACE FUNCTION transactionUpdate()
RETURNS trigger AS
$$
DECLARE currBalance integer;
BEGIN
	SELECT balance INTO currBalance from Wallet W where NEW.pid = W.wid;
	DELETE FROM Wallet W where NEW.pid=W.wid;
	INSERT INTO Wallet VALUES (NEW.pid, currBalance + NEW.transaction);
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER transactionUpdate
AFTER INSERT OR UPDATE ON Uses
FOR EACH ROW
EXECUTE PROCEDURE transactionUpdate();

CREATE OR REPLACE FUNCTION updateRideCheck()
RETURNS trigger AS
$$
DECLARE driverID varchar(9);
BEGIN
	IF (NEW.numSeats < 0) THEN
	RAISE EXCEPTION 'No more space left';
	RETURN NULL;
	END IF;
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER updateRideCheck
BEFORE UPDATE ON Rides
FOR EACH ROW
EXECUTE PROCEDURE updateRideCheck();



/* IF user has already placed a bid for that RID, delete that existing bid 
and insert new bid if
new bid + all other bid does not exceed wallet amount*/
CREATE OR REPLACE FUNCTION insertBidCheck()
RETURNS trigger AS
$$
DECLARE totalBids integer; existingBid integer; total integer;
BEGIN
	SELECT coalesce(sum(points),0) INTO totalBids FROM Bids where pid=NEW.pid;
	SELECT coalesce(points,0) INTO existingBid from Bids B where NEW.pid = B.pid and NEW.rid=B.rid;
	SELECT balance INTO total from Wallet W where w.wid=NEW.pid;
	IF (NEW.points < 0) THEN RAISE EXCEPTION 'Bid must be > 0';RETURN NULL;
	END IF;
	IF (EXISTS (SELECT 1 from Bids B where NEW.pid = B.pid and NEW.rid=B.rid) and 
			(totalBids-existingBid+NEW.points<=total)) THEN 
		DELETE FROM Bids B WHERE NEW.pid=B.pid and NEW.rid=B.rid;
		IF (NEW.points = 0) THEN RETURN NULL;
		ELSE return NEW;
		END IF;
	ELSIF (NOT EXISTS (SELECT 1 from Bids B where NEW.pid = B.pid and NEW.rid=B.rid) and NEW.points = 0) THEN
		RAISE EXCEPTION 'must bid more than 0 point';
		return NULL;
	ELSIF (total < (NEW.points + totalBids)) THEN RAISE EXCEPTION 'not enough points';RETURN NULL;
	END IF;
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER insertBidCheck
BEFORE INSERT ON Bids
FOR EACH ROW
EXECUTE PROCEDURE insertBidCheck();

CREATE OR REPLACE FUNCTION newUserInit()
RETURNS trigger AS
$$
BEGIN
	INSERT INTO Passengers(pid) VALUES (NEW.nric);
	INSERT INTO Wallet(wid,balance) VALUES (NEW.nric,0);
	INSERT INTO Uses(pid,transaction) VALUES (NEW.nric,0);
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER newUserInit
AFTER INSERT ON Users
FOR EACH ROW
EXECUTE PROCEDURE newUserInit();

/* Insert into Users */
INSERT INTO Users (name, username, password, nric, phonenumber, address) VALUES 
('Leslie Cole', 'LeslieCole', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000001A', '12345678', 'Kent Ridge'),
('Myra Morgan', 'MyraMorgan', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG','S0000002B', '12345677', 'Kent Ridge'),
('Raymond Benson', 'RaymondBenson', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000003C', '12345676', 'Kent Ridge'),
('Wendy Kelley', 'WendyKelley', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000004D', '12345675', 'Kent Ridge'),
('Patrick Bowers', 'PatrickBowers', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000005E', '12345674', 'Kent Ridge'),
('Ralph Hogan', 'RalphHogan', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000006F', '12345673', 'Kent Ridge'),
('Cecil Rodriquez', 'CecilRodriquez', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000007G', '12345672', 'Kent Ridge'),
('Delia Ferguson', 'DeliaFerguson', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000008H', '12345671', 'Kent Ridge'),
('Frances Wright', 'FrancesWright', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000009I', '12345670', 'Kent Ridge'),
('Alyssa Sims', 'AlyssaSims', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000010J', '12345681', 'Kent Ridge');

/* Insert into Drivers */
INSERT INTO Drivers (did) VALUES 
('S0000001A'),('S0000002B'),('S0000003C'),('S0000004D'),('S0000005E');

/* Insert into Cars */
INSERT INTO Cars (did,platenumber,model,numSeats) VALUES
('S0000001A','E13','model1',4),('S0000002B','B20','model1',4),('S0000003C','C11','model1',4),
('S0000004D','D31','model1',4),('S0000005E','E121','model1',4);

/* Insert into Rides */
INSERT INTO Rides (did, source, destination, numSeats,date) VALUES
('S0000001A', 'Kent Ridge', 'Buona',4,'2020/08/02 16:00'),
('S0000001A', 'Buona', 'Kent Ridge',2, '2020/07/12 12:00'),
('S0000002B', 'Toa Payoh', 'Pasir Ris',3,'2020/12/12 09:00'),
('S0000002B', 'Pasir Ris', 'Toa Payoh',2,'2020/02/16 12:00'),
('S0000003C', 'Paya Lebar', 'Macpherson',1,'2020/03/22 16:00'),
('S0000003C', 'Macpherson', 'Paya Lebar',2,'2020/09/27 13:00'),
('S0000004D', 'Jurong East', 'Seng Kang',3,'2020/11/02 16:00'),
('S0000004D', 'Seng Kang', 'Jurong East',1,'2020/02/13 18:00'),
('S0000005E', 'Somerset', 'Raffles Place',1,'2020/08/09 20:00'),
('S0000005E', 'Raffles Place', 'Somerset',2,'2020/06/19 22:00');

INSERT INTO Rides (rid,did, source, destination, numSeats, status, date) VALUES
(11,'S0000001A', 'Yishun', 'Yew Tee',4, 'close', '2019/01/02 16:00'),
(12,'S0000001A', 'Yew Tee', 'Yishun',4, 'close', '2019/03/02 12:00');

INSERT INTO Uses(pid,transaction) VALUES 
('S0000001A',1000), ('S0000002B',500), ('S0000003C',500), ('S0000004D',500), ('S0000005E',500),('S0000006F',100),
('S0000007G',500), ('S0000008H',500), ('S0000009I',500), ('S0000010J',500);


INSERT INTO BIDS(pid,rid,points) VALUES
('S0000007G',1,10), ('S0000008H',1,20), ('S0000009I',1,5),('S0000002B',2,1),('S0000003C',2,3),('S0000004D',2,10),
('S0000005E',2,20),('S0000002B',2,1),('S0000007G',3,20),('S0000009I',3,12),('S0000010J',3,2),('S0000004D',4,3),
('S0000004D',4,3),('S0000003C',4,11),('S0000010J',5,9),('S0000009I',5,18),('S0000002B',5,3),('S0000007G',5,10),
('S0000010J',6,5),('S0000009I',6,3),('S0000008H',6,14),('S0000002B',7,16),('S0000009I',7,15),('S0000003C',8,8),
('S0000005E',8,2),('S0000008H',8,9),('S0000002B',9,9),('S0000003C',10,4),('S0000002B',10,19),('S0000001A',10,20),
('S0000001A',7,2),('S0000006F',3,20),('S0000006F',1,11);


INSERT INTO BIDS(pid,rid,points,status) VALUES
('S0000006F',11,9,'Ride Confirmed'), ('S0000006F',12,1,'rejected');

UPDATE BIDS SET points=0 WHERE pid='S0000006F' and rid=12;

INSERT INTO Rates(raterid,ratedid,ratings,rid) VALUES 
('S0000006F','S0000001A',-1,11),('S0000001A','S0000006F',-1,11);

INSERT INTO Rides (rid, did, source, destination, numSeats, status, date) VALUES
(100,'S0000002B', 'Clementi', 'Tuas',4, 'close', '2019/02/02 16:00');

INSERT INTO History(userID,rid,points) VALUES 
('S0000006F',11,10),('S0000001A',100,1);

INSERT INTO Uses(pid,transaction) VALUES
('S0000006F',-10),('S0000001A',10);

INSERT INTO Uses(pid,transaction,date) VALUES
('S0000001A',9,'2019/03/16 16:00'),('S0000001A',5,'2019/03/23 16:00'),('S0000001A',3,'2019/03/01 16:00'),
('S0000001A',-10,'2019/03/07 12:00'),('S0000001A',-1,'2019/03/02 12:00'),('S0000001A',-2,'2019/03/02 16:00'),
('S0000001A',10,'2019/04/02 16:00'),('S0000001A',10,'2019/04/12 16:00'),('S0000001A',10,'2019/04/01 16:00'),
('S0000001A',-102,'2019/02/02 16:00'),('S0000001A',-12,'2019/02/12 16:00'),('S0000001A',-1,'2019/02/01 16:00');
