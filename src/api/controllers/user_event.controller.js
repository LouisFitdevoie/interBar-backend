const uuid = require("uuid");
const database = require("../../database.js");
const pool = database.pool;
const bcrypt = require("bcrypt");

class UserEvent {
  constructor(user_id, event_id, role) {
    this.user_id = user_id;
    this.event_id = event_id;
    this.role = role;
  }
  id = uuid.v4();
  user_id;
  event_id;
  role;
  left_event_at = null;
}

exports.getAllUsersEvents = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    //Return all user_event that are not deleted
    connection.query(
      "SELECT * FROM UsersEvents WHERE left_event_at IS null",
      (err, result) => {
        connection.release();
        if (err) throw err;
        res.send(result);
      }
    );
  });
};

exports.getAllUsersForEvent = (req, res) => {
  if (uuid.validate(req.params.event_id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT Users.id, Users.firstname, Users.lastname, Users.emailaddress, UsersEvents.role FROM UsersEvents INNER JOIN Users ON UsersEvents.user_id = Users.id WHERE UsersEvents.event_id = ? AND UsersEvents.left_event_at IS null",
        [req.params.event_id],
        (err, result) => {
          connection.release();
          if (err) throw err;
          res.send(result);
        }
      );
    });
  } else {
    res.status(400).send({ error: req.params.event_id + " is not a valid id" });
  }
};

exports.getUserRoleForEvent = (req, res) => {
  if (uuid.validate(req.query.eventId)) {
    if (uuid.validate(req.query.userId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "SELECT UsersEvents.role FROM UsersEvents WHERE UsersEvents.event_id = ? AND UsersEvents.user_id = ? AND UsersEvents.left_event_at IS null",
          [req.query.eventId, req.query.userId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              res.send(result[0]);
            } else {
              res.status(404).send({
                error: "User not found for this event or has left it",
              });
            }
          }
        );
      });
    } else {
      res
        .status(400)
        .send({ error: req.query.userId + " is not a valid user id" });
    }
  } else {
    res
      .status(400)
      .send({ error: req.query.eventId + " is not a valid event id" });
  }
};

exports.userJoinEvent = (req, res) => {
  if (uuid.validate(req.body.eventId)) {
    if (uuid.validate(req.body.userId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "SELECT id, endDate, seller_password FROM Events WHERE id = ? AND deleted_at IS null",
          [req.body.eventId],
          (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
              let endDate = result[0].endDate;
              const sellerPasswordHash = result[0].seller_password;
              connection.query(
                "SELECT id FROM Users WHERE id = ? AND deleted_at IS null",
                [req.body.userId],
                (err, result) => {
                  if (err) throw err;
                  if (result.length > 0) {
                    if (new Date() >= endDate) {
                      res.status(400).send({ error: "Event has ended" });
                    } else {
                      connection.query(
                        "SELECT id FROM UsersEvents WHERE user_id = ? AND event_id = ? AND left_event_at IS null",
                        [req.body.userId, req.body.eventId],
                        (err, result) => {
                          if (err) throw err;
                          if (result.length > 0) {
                            res.status(400).send({
                              error: "User already joined this event",
                            });
                          } else {
                            if (req.body.role === 0) {
                              //User
                              let userEvent = new UserEvent(
                                req.body.userId,
                                req.body.eventId,
                                req.body.role
                              );

                              connection.query(
                                "INSERT INTO UsersEvents (id, user_id, event_id, role, left_event_at) VALUES (?, ?, ?, ?, ?)",
                                [
                                  userEvent.id,
                                  userEvent.user_id,
                                  userEvent.event_id,
                                  userEvent.role,
                                  userEvent.left_event_at,
                                ],
                                (err, result) => {
                                  connection.release();
                                  if (err) throw err;
                                  if (process.env.NODE_ENV !== "testing")
                                    console.log({
                                      success: "User joined event",
                                    });
                                  res.status(200).send({
                                    success: "User successfully joined event",
                                  });
                                }
                              );
                            } else if (req.body.role === 1) {
                              //Seller
                              if (req.body.sellerPassword.length > 0) {
                                if (
                                  bcrypt.compareSync(
                                    req.body.sellerPassword,
                                    sellerPasswordHash
                                  )
                                ) {
                                  let userEvent = new UserEvent(
                                    req.body.userId,
                                    req.body.eventId,
                                    req.body.role
                                  );

                                  connection.query(
                                    "INSERT INTO UsersEvents (id, user_id, event_id, role, left_event_at) VALUES (?, ?, ?, ?, ?)",
                                    [
                                      userEvent.id,
                                      userEvent.user_id,
                                      userEvent.event_id,
                                      userEvent.role,
                                      userEvent.left_event_at,
                                    ],
                                    (err, result) => {
                                      connection.release();
                                      if (err) throw err;
                                      if (process.env.NODE_ENV !== "testing")
                                        console.log({
                                          success: "Seller joined event",
                                        });
                                      res.status(200).send({
                                        success:
                                          "Seller successfully joined event",
                                      });
                                    }
                                  );
                                } else {
                                  connection.release();
                                  res.status(400).send({
                                    error: "Seller password incorrect",
                                  });
                                }
                              } else {
                                connection.release();
                                res
                                  .status(400)
                                  .send({ error: "Seller password required" });
                              }
                            } else if (req.body.role === 2) {
                              //Organizer
                              connection.query(
                                "SELECT user_id FROM UsersEvents WHERE event_id = ? AND role = 2 AND left_event_at IS null",
                                [req.body.eventId],
                                (err, result) => {
                                  if (err) throw err;
                                  if (result.length > 0) {
                                    res.status(400).send({
                                      error:
                                        "Organizer already joined this event",
                                    });
                                  } else {
                                    let userEvent = new UserEvent(
                                      req.body.userId,
                                      req.body.eventId,
                                      req.body.role
                                    );
                                    if (process.env.NODE_ENV !== "testing")
                                      console.log("Organizer ok");

                                    connection.query(
                                      "INSERT INTO UsersEvents (id, user_id, event_id, role, left_event_at) VALUES (?, ?, ?, ?, ?)",
                                      [
                                        userEvent.id,
                                        userEvent.user_id,
                                        userEvent.event_id,
                                        userEvent.role,
                                        userEvent.left_event_at,
                                      ],
                                      (err, result) => {
                                        connection.release();
                                        if (err) throw err;
                                        if (process.env.NODE_ENV !== "testing")
                                          console.log({
                                            success: "Organizer joined event",
                                          });
                                        res.status(200).send({
                                          success:
                                            "Organizer successfully joined event",
                                        });
                                      }
                                    );
                                  }
                                }
                              );
                            } else {
                              connection.release();
                              res.status(400).send({
                                error: "Invalid role, must be 0, 1 or 2",
                              });
                            }
                          }
                        }
                      );
                    }
                  } else {
                    connection.release();
                    res.status(404).send({ error: "User not found" });
                  }
                }
              );
            } else {
              connection.release();
              res.status(404).send({ error: "Event not found" });
            }
          }
        );
      });
    } else {
      res
        .status(400)
        .send({ error: req.body.userId + " is not a valid user id" });
    }
  } else {
    res
      .status(400)
      .send({ error: req.body.eventId + " is not a valid event id" });
  }
};

exports.quitEvent = (req, res) => {
  if (uuid.validate(req.body.eventId)) {
    if (uuid.validate(req.body.userId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "SELECT id FROM Users WHERE id = ? AND deleted_at IS null",
          [req.body.userId],
          (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
              connection.query(
                "SELECT id FROM Events WHERE id = ? AND deleted_at IS null",
                [req.body.eventId],
                (err, result) => {
                  if (err) throw err;
                  if (result.length > 0) {
                    connection.query(
                      "SELECT id, role FROM UsersEvents WHERE user_id = ? AND event_id = ? AND left_event_at IS null",
                      [req.body.userId, req.body.eventId],
                      (err, result) => {
                        if (err) throw err;
                        if (result.length > 0) {
                          if (result[0].role === 0) {
                            //User
                            connection.query(
                              "UPDATE UsersEvents SET left_event_at = NOW() WHERE user_id = ? AND event_id = ? AND left_event_at IS null",
                              [req.body.userId, req.body.eventId],
                              (err, result) => {
                                connection.release();
                                if (err) throw err;
                                if (process.env.NODE_ENV !== "testing")
                                  console.log({ success: "User quit event" });
                                res.status(200).send({
                                  success: "User successfully quit event",
                                });
                              }
                            );
                          } else if (result[0].role === 1) {
                            //Seller
                            connection.query(
                              "UPDATE UsersEvents SET left_event_at = NOW() WHERE user_id = ? AND event_id = ? AND left_event_at IS null",
                              [req.body.userId, req.body.eventId],
                              (err, result) => {
                                connection.release();
                                if (err) throw err;
                                if (process.env.NODE_ENV !== "testing")
                                  console.log({ success: "Seller quit event" });
                                res.status(200).send({
                                  success: "Seller successfully quit event",
                                });
                              }
                            );
                          } else if (result[0].role === 2) {
                            //Organizer
                            connection.release();
                            res
                              .status(400)
                              .send({ error: "Organizer cannot quit event" });
                          } else {
                            connection.release();
                            res.status(400).send({
                              error: "Invalid role, must be 0, 1 or 2",
                            });
                          }
                        } else {
                          connection.release();
                          res
                            .status(400)
                            .send({ error: "User not joined this event" });
                        }
                      }
                    );
                  } else {
                    connection.release();
                    res.status(404).send({ error: "Event not found" });
                  }
                }
              );
            } else {
              connection.release();
              res.status(404).send({ error: "User not found" });
            }
          }
        );
      });
    } else {
      res
        .status(400)
        .send({ error: req.body.userId + " is not a valid user id" });
    }
  } else {
    res
      .status(400)
      .send({ error: req.body.eventId + " is not a valid event id" });
  }
};

exports.userToSeller = (req, res) => {
  if (uuid.validate(req.body.eventId)) {
    if (uuid.validate(req.body.userId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "SELECT id FROM Users WHERE id = ? AND deleted_at IS null",
          [req.body.userId],
          (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
              connection.query(
                "SELECT id, seller_password FROM Events WHERE id = ? AND deleted_at IS null",
                [req.body.eventId],
                (err, result) => {
                  if (err) throw err;
                  if (result.length > 0) {
                    if (req.body.sellerPassword.length > 0) {
                      if (
                        bcrypt.compareSync(
                          req.body.sellerPassword,
                          result[0].seller_password
                        )
                      ) {
                        connection.query(
                          "SELECT role FROM UsersEvents WHERE user_id = ? AND event_id = ? AND left_event_at IS null",
                          [req.body.userId, req.body.eventId],
                          (err, result) => {
                            if (err) throw err;
                            if (result.length > 0) {
                              if (result[0].role === 0) {
                                //User
                                connection.query(
                                  "UPDATE UsersEvents SET role = 1 WHERE user_id = ? AND event_id = ? AND left_event_at IS null",
                                  [req.body.userId, req.body.eventId],
                                  (err, result) => {
                                    connection.release();
                                    if (err) throw err;
                                    if (process.env.NODE_ENV !== "testing")
                                      console.log({
                                        success: "User to seller",
                                      });
                                    res.status(200).send({
                                      success:
                                        "Successfully changed user to seller",
                                    });
                                  }
                                );
                              } else {
                                connection.release();
                                res.status(400).send({
                                  error: "User has not the role user",
                                });
                              }
                            } else {
                              connection.release();
                              res
                                .status(400)
                                .send({ error: "User not joined this event" });
                            }
                          }
                        );
                      } else {
                        connection.release();
                        res
                          .status(400)
                          .send({ error: "Seller password incorrect" });
                      }
                    } else {
                      connection.release();
                      res
                        .status(400)
                        .send({ error: "Seller password required" });
                    }
                  } else {
                    connection.release();
                    res.status(404).send({ error: "Event not found" });
                  }
                }
              );
            } else {
              connection.release();
              res.status(404).send({ error: "User not found" });
            }
          }
        );
      });
    } else {
      res
        .status(400)
        .send({ error: req.body.userId + " is not a valid user id" });
    }
  } else {
    res
      .status(400)
      .send({ error: req.body.eventId + " is not a valid event id" });
  }
};

exports.sellerToUser = (req, res) => {
  if (uuid.validate(req.body.eventId)) {
    if (uuid.validate(req.body.userId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "SELECT id FROM Users WHERE id = ? AND deleted_at IS null",
          [req.body.userId],
          (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
              connection.query(
                "SELECT id FROM Events WHERE id = ? AND deleted_at IS null",
                [req.body.eventId],
                (err, result) => {
                  if (err) throw err;
                  if (result.length > 0) {
                    connection.query(
                      "SELECT role FROM UsersEvents WHERE user_id = ? AND event_id = ? AND left_event_at IS null",
                      [req.body.userId, req.body.eventId],
                      (err, result) => {
                        if (err) throw err;
                        if (result.length > 0) {
                          if (result[0].role === 1) {
                            //User
                            connection.query(
                              "UPDATE UsersEvents SET role = 0 WHERE user_id = ? AND event_id = ? AND left_event_at IS null",
                              [req.body.userId, req.body.eventId],
                              (err, result) => {
                                connection.release();
                                if (err) throw err;
                                if (process.env.NODE_ENV !== "testing")
                                  console.log({ success: "Seller to user" });
                                res.status(200).send({
                                  success:
                                    "Successfully changed role from seller to user",
                                });
                              }
                            );
                          } else {
                            connection.release();
                            res
                              .status(400)
                              .send({ error: "User has not the role seller" });
                          }
                        } else {
                          connection.release();
                          res
                            .status(400)
                            .send({ error: "User not joined this event" });
                        }
                      }
                    );
                  } else {
                    connection.release();
                    res.status(404).send({ error: "Event not found" });
                  }
                }
              );
            } else {
              connection.release();
              res.status(404).send({ error: "User not found" });
            }
          }
        );
      });
    } else {
      res
        .status(400)
        .send({ error: req.body.userId + " is not a valid user id" });
    }
  } else {
    res
      .status(400)
      .send({ error: req.body.eventId + " is not a valid event id" });
  }
};

exports.getAllEventsForUser = (req, res) => {
  //Get all events for user with id
  if (uuid.validate(req.params.userId)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT id FROM Users WHERE id = ? AND deleted_at IS null",
        [req.params.userId],
        (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            connection.query(
              "SELECT Events.id, Events.name, Events.description, Events.startdate, Events.enddate, Events.created_at, Events.location, UsersEvents.role FROM Events INNER JOIN UsersEvents ON Events.id = UsersEvents.event_id WHERE UsersEvents.user_id = ? AND UsersEvents.left_event_at IS null AND Events.deleted_at IS null",
              [req.params.userId],
              (err, result) => {
                if (err) throw err;
                if (process.env.NODE_ENV !== "testing")
                  console.log("Getting all events for user");
                result.sort((a, b) => {
                  return new Date(a.startdate) - new Date(b.startdate);
                });
                let eventsToReturn = [];
                result.forEach((event) => {
                  connection.query(
                    "SELECT Users.firstname, Users.lastname FROM Users INNER JOIN UsersEvents ON Users.id = UsersEvents.user_id WHERE UsersEvents.event_id = ? AND UsersEvents.role = 2",
                    [event.id],
                    (err, result) => {
                      if (err) throw err;
                      event.organizer =
                        result[0].firstname + " " + result[0].lastname;
                      eventsToReturn.push(event);
                    }
                  );
                });
                setTimeout(() => {
                  connection.release();
                  res.send(eventsToReturn);
                }, 1000);
              }
            );
          } else {
            connection.release();
            res.status(404).send({ error: "User not found" });
          }
        }
      );
    });
  } else {
    res
      .status(400)
      .send({ error: req.params.userId + " is not a valid user id" });
  }
};
