var gps = require("../index");
var sql = require("mssql");

const mssql_config = {
  user: "sa",
  password: "2014",
  database: "ool_gps",
  server: "localhost\\E2014" // You can use 'localhost\\instance' to connect to named instance
};

sql.on("error", err => {
  console.error(err);
});

(async function() {
  try {
    sql.pool = await sql.connect(mssql_config);
    console.log("Connected to sql!");
  } catch (err) {
    console.error(err);
  }
})();

const dbInsertLocation = async function(device, data) {
  try {
    // Stored procedure
    let result2 = await sql.pool.request().input("imei", sql.VarChar, device.getUID()).input("lat", sql.Float, data.latitude).input("lon", sql.Float, data.longitude).execute("insert_gps_event");
  } catch (err) {
    console.error(err);
  }
};

var options = {
  debug: true,
  port: 6100,
  device_adapter: "GT06"
};

var server = gps.server(options, function(device, connection) {
  device.on("login_request", function(device_id, msg_parts) {
    // Some devices sends a login request before transmitting their position
    // Do some stuff before authenticate the device...

    // Accept the login request. You can set false to reject the device.
    this.login_authorized(true);
  });

  //PING -> When the gps sends their position
  device.on("ping", function(data) {
    //After the ping is received, but before the data is saved
    // console.log(data);
    // let d = device;

    dbInsertLocation(device, data);
    return data;
  });
});

server.setDebug(false);
