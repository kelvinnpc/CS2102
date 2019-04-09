DROP TABLE IF EXISTS Rates;
DROP TABLE IF EXISTS Wallet;
DROP TABLE IF EXISTS Uses;
DROP TABLE IF EXISTS Cars;
DROP TABLE IF EXISTS Bids;
DROP TABLE IF EXISTS History;
DROP TABLE IF EXISTS Rides;
DROP TABLE IF EXISTS Drivers;
DROP TABLE IF EXISTS Passengers;
DROP TABLE IF EXISTS AccessHelpDesk;
DROP TABLE IF EXISTS Users;

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
	did varchar(9) references Users (nric),
	source varchar(255) NOT NULL,
	destination varchar(255) NOT NULL,
	numSeats integer,
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
	wid varchar(9) references Passengers (pid),
	balance int NOT NULL,
	primary key (wid)
);

CREATE TABLE Uses (
	pid varchar(9) references Passengers (pid),
	transaction integer,
	date timestamp default current_timestamp,
	primary key (date, pid)
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
	rid integer references Rides (rid),
	points int NOT NULL,
	status varchar(20) default 'pending',
	primary key (pid, rid)
);

CREATE TABLE History (
	userID varchar(9) references Users (nric),
	rid integer references Rides (rid),
	points integer
);

create table AccessHelpDesk (
    userID varchar(9) references Users (nric),
    message varchar(1000),
    date timestamp default current_timestamp,
    primary key (date)
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
BEFORE INSERT OR UPDATE ON Rides
FOR EACH ROW
EXECUTE PROCEDURE rideCheck();


CREATE OR REPLACE FUNCTION topUpCheck()
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

CREATE TRIGGER topUpCheck
AFTER INSERT OR UPDATE ON Uses
FOR EACH ROW
when (NEW.transaction > 0)
EXECUTE PROCEDURE topUpCheck();

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

--Insert into Users
INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Leslie Cole', 'LeslieCole', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000001A', '12345678', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Myra Morgan', 'MyraMorgan', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG','S0000002B', '12345677', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Raymond Benson', 'RaymondBenson', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000003C', '12345676', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Wendy Kelley', 'WendyKelley', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000004D', '12345675', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Patrick Bowers', 'PatrickBowers', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000005E', '12345674', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Ralph Hogan', 'RalphHogan', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000006F', '12345673', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Cecil Rodriquez', 'CecilRodriquez', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000007G', '12345672', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Delia Ferguson', 'DeliaFerguson', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000008H', '12345671', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Frances Wright', 'FrancesWright', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000009I', '12345670', 'Kent Ridge');

INSERT INTO Users (name, username, password, nric, phonenumber, address)
VALUES ('Alyssa Sims', 'AlyssaSims', '$2b$10$qISl6Wshq80lkZrT2U0EreIF18Eh4kc76QzATG91Rl.PE0oey0CdG', 'S0000010J', '12345681', 'Kent Ridge');
--Insert into Drivers
INSERT INTO Drivers (did) VALUES 
('S0000001A'),
('S0000004D');

--Insert into Rides
INSERT INTO Rides (did, source, destination, numSeats,date) VALUES
('S0000001A', 'Kent Ridge', 'Buona',1,'2019/04/02 16:04'),
('S0000001A', 'Buona', 'Kent Ridge',2, '2019/05/12 16:04'),
('S0000004D', 'Kent Ridge', 'Buona',3,'2019/03/22 16:04');

INSERT INTO Uses(pid,transaction) VALUES ('S0000002B',500), ('S0000001A',500),('S0000004D',500);
INSERT INTO BIDS(pid,rid,points) VALUES ('S0000002B',1,100);
INSERT INTO BIDS(pid,rid,points) VALUES ('S0000002B',1,150);
INSERT INTO BIDS(pid,rid,points) VALUES ('S0000001A',5,160),('S0000002B',5,150),('S0000004D',5,140);


Select * from bids;

/* complicated query */
select coalesce(sum(case when transaction >= 0 then transaction end),0) as topUp,
						coalesce(sum(case when transaction < 0 then transaction end),0) as deducted, 
						to_char(date, 'YYYY-MM') as year_month from uses where 's7654321z' = uses.pid group by year_month order by year_month;

