Dependencies
------------

Mongo: `brew install mongo`
Install dependencies: `npm install`

Running the Server
------------------

Run mongo: `mongod -f /usr/local/etc/mongod.conf`
`node app.js`

Deployment
----------

It's best to run the server on port 843. AVAST and a few other Antivirus programs block websockets and XHR polling on other ports. 843 offers maximum compatibility.
