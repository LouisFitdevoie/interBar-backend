const uuid = require("uuid");
const database = require("../../database.js");
const isAfter = require("date-fns/isAfter");
const isBefore = require("date-fns/isBefore");
const bcrypt = require("bcrypt");

const pool = database.pool;

class Event {
  constructor(
    name,
    startDate,
    endDate,
    location,
    description,
    seller_password
  ) {
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
    this.description = description;
    this.seller_password = bcrypt.hashSync(seller_password, 10);
  }
  id = uuid.v4();
  name;
  startDate;
  endDate;
  location;
  description = null;
  seller_password;
  created_at = new Date();
  deleted_at = null;
}

exports.getAllEvents = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "SELECT * FROM Events WHERE deleted_at IS null ORDER BY name",
      (err, result) => {
        connection.release();
        if (err) throw err;
        res.send(result);
      }
    );
  });
};

exports.getEventById = (req, res) => {
  if (uuid.validate(req.query.id)) {
    //Verify that the id is a valid uuid
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting event with id ${req.query.id}`);
      connection.query(
        "SELECT * FROM Events WHERE id = ? AND deleted_at IS null",
        [req.query.id],
        (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            console.log("Number of events found: " + result.length + "");
            const event = result[0];
            connection.query(
              "SELECT user_id FROM UsersEvents WHERE event_id=? AND role=2",
              [req.query.id],
              (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                  event.organizer_id = result[0].user_id;
                  connection.query(
                    "SELECT firstname, lastname FROM Users WHERE id=?",
                    [event.organizer_id],
                    (err, result) => {
                      connection.release();
                      if (err) throw err;
                      if (result.length > 0) {
                        event.organizer =
                          result[0].firstname + " " + result[0].lastname;
                        res.send(event);
                      } else {
                        console.log("User not found with organizerId");
                        res
                          .status(404)
                          .send({ error: "User not found with organizerId" });
                      }
                    }
                  );
                } else {
                  console.log("Organizer id not found");
                  res.status(404).send({ error: "Organizer id not found" });
                }
              }
            );
          } else {
            console.log("No events found");
            res
              .status(404)
              .send({ error: "No events found for the id " + req.query.id });
          }
        }
      );
    });
  } else {
    console.log(`Invalid id ${req.query.id}`);
    res
      .status(400)
      .send({ error: "Invalid id, " + req.query.id + " is not a valid uuid" });
  }
};

exports.getEventByName = (req, res) => {
  pool.getConnection((err, connection) => {
    console.log("Getting events with name " + req.query.name.trim());
    connection.query(
      "SELECT * FROM Events WHERE name LIKE ? AND deleted_at IS null ORDER BY startDate",
      "%" + req.query.name.trim() + "%",
      function (err, result) {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          console.log("Number of events found: " + result.length + "");
          res.send(result);
        } else {
          console.log("No events found");
          res.status(404).send({
            error: "No events found for the name " + req.query.name.trim(),
          });
        }
      }
    );
  });
};

exports.getEventBetweenDates = (req, res) => {
  let startDate = req.query.startDate.trim();
  let endDate = req.query.endDate.trim();
  if (startDate > endDate) {
    console.log("Start date is after end date");
    res.status(400).send({ error: "Start date is after end date" });
  } else {
    if (req.body.mode === "start") {
      console.log(
        "Getting events where startDate between " +
          startDate +
          " and " +
          endDate
      );
      pool.getConnection((err, connection) => {
        connection.query(
          "SELECT * FROM Events WHERE startDate between ? and ? AND deleted_at IS null ORDER BY startDate",
          [startDate, endDate],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log("Number of events found: " + result.length + "");
              res.send(result);
            } else {
              console.log("No events found");
              res.status(404).send({
                error:
                  "No events found between " + startDate + " and " + endDate,
              });
            }
          }
        );
      });
    } else if (req.body.mode === "end") {
      console.log(
        "Getting events where endDate between " + startDate + " and " + endDate
      );
      pool.getConnection((err, connection) => {
        connection.query(
          "SELECT * FROM Events WHERE endDate between ? and ? AND deleted_at IS null ORDER BY startDate",
          [startDate, endDate],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log("Number of events found: " + result.length + "");
              res.send(result);
            } else {
              console.log("No events found");
              res.status(404).send({
                error:
                  "No events found between " + startDate + " and " + endDate,
              });
            }
          }
        );
      });
    } else if (req.body.mode === "both") {
      console.log(
        "Getting events where both start and end dates between " +
          startDate +
          " and " +
          endDate
      );
      pool.getConnection((err, connection) => {
        connection.query(
          "SELECT * FROM Events WHERE startDate between ? and ? AND endDate between ? and ? AND deleted_at IS null ORDER BY startDate",
          [startDate, endDate, startDate, endDate],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log("Number of events found: " + result.length + "");
              res.send(result);
            } else {
              console.log("No events found");
              res.status(404).send({
                error:
                  "No events found between " + startDate + " and " + endDate,
              });
            }
          }
        );
      });
    } else {
      console.log("No mode specified");
      res.status(400).send({ error: "No mode specified" });
    }
  }
};

exports.getFutureEvents = (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query(
      "SELECT * FROM Events WHERE startDate > NOW() AND deleted_at IS null ORDER BY startDate",
      (err, result) => {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          console.log("Number of events found: " + result.length + "");
          res.send(result);
        } else {
          console.log("No future events found");
          res.status(404).send({ error: "No future events found" });
        }
      }
    );
  });
};

exports.getCurrentEvents = (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query(
      "SELECT * FROM Events WHERE startDate <= NOW() AND endDate >= NOW() AND deleted_at IS null ORDER BY startDate",
      (err, result) => {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          console.log("Number of events found: " + result.length + "");
          res.send(result);
        } else {
          console.log("No current events found");
          res.status(404).send({ error: "No current events found" });
        }
      }
    );
  });
};

exports.getPastEvents = (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query(
      "SELECT * FROM Events WHERE endDate < NOW() AND deleted_at IS null ORDER BY startDate",
      (err, result) => {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          console.log("Number of events found: " + result.length + "");
          res.send(result);
        } else {
          console.log("No past events found");
          res.status(404).send({ error: "No past events found" });
        }
      }
    );
  });
};

exports.createEvent = (req, res) => {
  console.log("Verifying data for event creation");
  if (isAfter(new Date(req.body.startDate), new Date())) {
    if (isAfter(new Date(req.body.endDate), new Date(req.body.startDate))) {
      if (req.body.name.trim().length > 0) {
        if (req.body.location.trim().length > 0) {
          if (
            req.body.seller_password.trim().length > 7 &&
            req.body.seller_password
              .trim()
              .match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)
          ) {
            let eventToCreate = new Event(
              req.body.name.trim(),
              new Date(req.body.startDate),
              new Date(req.body.endDate),
              req.body.location.trim(),
              req.body.description ? req.body.description.trim() : null,
              req.body.seller_password.trim()
            );
            pool.getConnection((err, connection) => {
              if (err) throw err;
              connection.query(
                "SELECT * FROM Events WHERE (name = ? AND startDate = ? AND endDate = ? AND location = ? AND deleted_at IS null)",
                [
                  eventToCreate.name,
                  eventToCreate.startDate,
                  eventToCreate.endDate,
                  eventToCreate.location,
                ],
                (err, result) => {
                  if (err) throw err;
                  if (result.length > 0) {
                    connection.release();
                    console.log("Event already exists");
                    res.status(400).send({ error: "Event already exists" });
                  } else {
                    connection.query(
                      "INSERT INTO Events (id, name, startDate, endDate, location, description, seller_password, created_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      [
                        eventToCreate.id,
                        eventToCreate.name,
                        eventToCreate.startDate,
                        eventToCreate.endDate,
                        eventToCreate.location,
                        eventToCreate.description,
                        eventToCreate.seller_password,
                        eventToCreate.created_at,
                        eventToCreate.deleted_at,
                      ],
                      (err, result) => {
                        connection.release();
                        if (err) throw err;
                        console.log("Event created");
                        res.status(200).send({
                          success: "Event created successfully",
                          eventId: eventToCreate.id,
                        });
                      }
                    );
                  }
                }
              );
            });
          } else {
            console.log("Seller password not specified");
            res.status(400).send({ error: "Seller password not specified" });
          }
        } else {
          res.status(404).send({ error: "No location specified" });
        }
      } else {
        res.status(404).send({ error: "Name is required" });
      }
    } else {
      res.status(404).send({ error: "End date is before start date" });
    }
  } else {
    res.status(404).send({ error: "Start date is before current date" });
  }
};

exports.deleteEvent = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT * FROM Events WHERE id = ? AND deleted_at IS null",
        [req.params.id],
        (err, result) => {
          if (err) throw err;
          if (result.length != 1) {
            connection.release();
            console.log("Event with id " + req.params.id + " does not exist");
            res.status(404).send({
              error: "Event with id " + req.params.id + " does not exist",
            });
          } else {
            console.log("Event product with id " + req.params.id);
            connection.query(
              "UPDATE Events SET deleted_at = NOW() WHERE id = ?",
              [req.params.id],
              (err, result) => {
                connection.release();
                if (err) throw err;
                console.log("Event deleted");
                res.status(200).send({
                  success: "Event deleted successfully",
                  result: result,
                });
              }
            );
          }
        }
      );
    });
  } else {
    res
      .status(404)
      .send({ error: "Invalid id, " + req.query.id + " is not a valid uuid" });
  }
};

exports.editSellerPassword = (req, res) => {
  let now = new Date();
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT enddate, seller_password FROM Events WHERE id = ? AND deleted_at IS null",
        [req.params.id],
        (err, result) => {
          if (err) throw err;
          if (result.length === 1) {
            if (isBefore(now, result[0].enddate)) {
              if (req.body.seller_password) {
                if (
                  bcrypt.compareSync(
                    req.body.seller_password,
                    result[0].seller_password
                  )
                ) {
                  if (
                    req.body.new_seller_password &&
                    req.body.new_seller_password_confirmation
                  ) {
                    if (
                      req.body.new_seller_password.trim().length > 7 &&
                      req.body.new_seller_password
                        .trim()
                        .match(
                          /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/
                        )
                    ) {
                      if (
                        req.body.new_seller_password ===
                        req.body.new_seller_password_confirmation
                      ) {
                        connection.query(
                          "UPDATE Events SET seller_password = ? WHERE id = ?",
                          [
                            bcrypt.hashSync(req.body.new_seller_password, 10),
                            req.params.id,
                          ],
                          (err, result) => {
                            connection.release();
                            if (err) throw err;
                            console.log("Seller password updated");
                            res.status(200).send({
                              success: "Seller password updated successfully",
                            });
                          }
                        );
                      } else {
                        connection.release();
                        console.log(
                          "New seller password and confirmation do not match"
                        );
                        res.status(400).send({
                          error:
                            "New seller password and confirmation do not match",
                        });
                      }
                    } else {
                      connection.release();
                      console.log("New seller password is not valid");
                      res
                        .status(400)
                        .send({ error: "New seller password is not valid" });
                    }
                  } else {
                    connection.release();
                    console.log("New seller password not specified");
                    res
                      .status(400)
                      .send({ error: "New seller password not specified" });
                  }
                } else {
                  connection.release();
                  console.log("Seller password is incorrect");
                  res
                    .status(400)
                    .send({ error: "Seller password is incorrect" });
                }
              } else {
                console.log("No seller password specified");
                res.status(400).send({ error: "No seller password specified" });
              }
            } else {
              console.log("Event with id " + req.params.id + " has ended");
              res.status(404).send({
                error: "Event with id " + req.params.id + " has ended",
              });
            }
          } else {
            connection.release();
            console.log("Event with id " + req.params.id + " does not exist");
            res.status(404).send({
              error: "Event with id " + req.params.id + " does not exist",
            });
          }
        }
      );
    });
  } else {
    res
      .status(404)
      .send({ error: "Invalid id, " + req.query.id + " is not a valid uuid" });
  }
};

exports.editEvent = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT name, startdate, enddate, location, description FROM Events WHERE id = ? AND deleted_at IS null",
        [req.params.id],
        (err, result) => {
          if (err) throw err;
          if (result.length === 1) {
            let isStartDateBefore = isBefore(
              new Date(),
              new Date(result[0].startdate)
            );
            if (isStartDateBefore) {
              let valuesToEdit = [
                req.body.name && req.body.name != result[0].name ? true : false,
                req.body.startDate &&
                new Date(req.body.startDate) > new Date() &&
                new Date(req.body.startDate) != new Date(result[0].startdate)
                  ? true
                  : false,
                req.body.endDate &&
                new Date(req.body.endDate) > new Date() &&
                new Date(req.body.endDate) != new Date(result[0].endDate)
                  ? true
                  : false,
                req.body.location && req.body.location != result[0].location
                  ? true
                  : false,
                req.body.description &&
                req.body.description != result[0].description
                  ? true
                  : false,
              ];
              console.log(valuesToEdit);
              if (valuesToEdit.includes(true)) {
                let sql = "UPDATE Events SET ";
                let values = [];
                if (valuesToEdit[0]) {
                  values.push(req.body.name.trim());
                  if (
                    valuesToEdit[1] ||
                    valuesToEdit[2] ||
                    valuesToEdit[3] ||
                    valuesToEdit[4]
                  ) {
                    sql += "name = ?, ";
                  } else {
                    sql += "name = ?";
                  }
                }
                if (valuesToEdit[1]) {
                  values.push(new Date(req.body.startDate));
                  if (valuesToEdit[2] || valuesToEdit[3] || valuesToEdit[4]) {
                    sql += "startdate = ?, ";
                  } else {
                    sql += "startdate = ?";
                  }
                }
                if (valuesToEdit[2]) {
                  values.push(new Date(req.body.endDate));
                  if (valuesToEdit[3] || valuesToEdit[4]) {
                    sql += "enddate = ?, ";
                  } else {
                    sql += "enddate = ?";
                  }
                }
                if (valuesToEdit[3]) {
                  values.push(req.body.location.trim());
                  if (valuesToEdit[4]) {
                    sql += "location = ?, ";
                  } else {
                    sql += "location = ?";
                  }
                }
                if (valuesToEdit[4]) {
                  values.push(req.body.description.trim());
                  sql += "description = ?";
                }
                sql += " WHERE id = ? AND deleted_at IS null";
                values.push(req.params.id);
                connection.query(sql, values, (err, result) => {
                  connection.release();
                  if (err) throw err;
                  console.log("Event edited");
                  res
                    .status(200)
                    .send({ success: "Event edited successfully" });
                });
              } else {
                connection.release();
                console.log("No values to edit");
                res.status(400).send({ error: "No values to edit" });
              }
            } else {
              if (
                req.body.endDate &&
                req.body.startDate === null &&
                req.body.name === null &&
                req.body.location === null &&
                req.body.description === null
              ) {
                connection.query(
                  "UPDATE Events SET enddate = ? WHERE id = ? AND deleted_at IS null",
                  [new Date(req.body.endDate), req.params.id],
                  (err, result) => {
                    connection.release();
                    if (err) throw err;
                    console.log("Event endDate successfully edited");
                    res
                      .status(200)
                      .send({ success: "Event endDate successfully edited" });
                  }
                );
              } else {
                connection.release();
                console.log("Event has already started");
                res.status(400).send({ error: "Event has already started" });
              }
            }
          } else {
            connection.release();
            console.log("Event with id " + req.params.id + " does not exist");
            res.status(404).send({
              error: "Event with id " + req.params.id + " does not exist",
            });
          }
        }
      );
    });
  } else {
    res
      .status(404)
      .send({ error: "Invalid id, " + req.query.id + " is not a valid uuid" });
  }
};
