## Installation
#### Install the following tools
1. postgresql
2. node

## After installing the tools:
1. Open terminal and switch to the directory the application is in
2. Run `npm install` to install the relevant node modules
3. Create a .env file
4. Enter into the .env file`DATABASE URL=postgres://<username>:<password>@<host address>:<port>/<database name>` 
   Replace the values in <> according to your PostgreSQL configuration.


## How to deploy Application?
1. Open terminal and switch to the directory the application is in
2. Enter `psql -U <username>` where <username> is your username in PostgreSQL
3. Enter `\i postgresql_script.sql` to initiate the database

4. Open another terminal and switch to the directory the application is in
5. Enter `node bin\www` to start the local server
6. Open a browser and go to "localhost:3000"

