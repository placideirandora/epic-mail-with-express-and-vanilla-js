/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import chai from "chai";
import chaiHTTP from "chai-http";
import server from "../server";
import database from "../db/database";
import {
  newUser, newUser2, admin, newUserLogIn, passReset, falsePassReset, falseAdminPass,
  newUserLogIn2, falseAdminEmail, newUserEmailTaken, newUserNameTaken,
} from "./dummy";

chai.use(chaiHTTP);
chai.should();

describe("USER ENDPOINT TESTS", () => {
  let adminToken;
  it("Should register a new user", (done) => {
    chai.request(server)
      .post("/api/v2/auth/signup")
      .send(newUser)
      .set("Accept", "Application/JSON")
      .end((err, res) => {
        res.body.should.have.status(201);
        res.body.should.have.property("status").eql(201);
        res.body.should.have.property("success").eql("user registered");
        res.body.should.be.a("object");
        res.body.data.should.be.a("array");
        done();
      });
  });

  it("Should register a second new user", (done) => {
    chai.request(server)
      .post("/api/v2/auth/signup")
      .send(newUser2)
      .set("Accept", "Application/JSON")
      .end((err, res) => {
        res.body.should.have.status(201);
        res.body.should.have.property("status").eql(201);
        res.body.should.have.property("success").eql("user registered");
        res.body.should.be.a("object");
        res.body.data.should.be.a("array");
        done();
      });
  });

  it("Should not register the third new user, because the email will have been already taken", (done) => {
    chai.request(server)
      .post("/api/v2/auth/signup")
      .send(newUserEmailTaken)
      .set("Accept", "Application/JSON")
      .end((err, res) => {
        res.body.should.have.status(400);
        res.body.should.have.property("status").eql(400);
        res.body.should.have.property("error").eql("the email is already taken. register with a unique email");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should not register the third new user, because the name will have been already taken", (done) => {
    chai.request(server)
      .post("/api/v2/auth/signup")
      .send(newUserNameTaken)
      .set("Accept", "Application/JSON")
      .end((err, res) => {
        res.body.should.have.status(400);
        res.body.should.have.property("status").eql(400);
        res.body.should.have.property("error").eql("user with the specified name is already registered");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should login the new user", (done) => {
    chai.request(server)
      .post("/api/v2/auth/login")
      .send(newUserLogIn)
      .set("Accept", "Application/JSON")
      .end((err, res) => {
        res.body.should.have.status(200);
        res.body.should.have.property("status").eql(200);
        res.body.should.have.property("success").eql("logged in");
        res.body.should.have.property("token");
        res.body.should.be.a("object");
        res.body.data.should.be.a("array");
        done();
      });
  });

  it("Should not login the admin, because the email is invalid", (done) => {
    chai.request(server)
      .post("/api/v2/auth/login")
      .send(falseAdminEmail)
      .set("Accept", "Application/JSON")
      .end((err, res) => {
        res.body.should.have.status(404);
        res.body.should.have.property("status").eql(404);
        res.body.should.have.property("error").eql("invalid email");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should not login the admin, because the password is incorrect", (done) => {
    chai.request(server)
      .post("/api/v2/auth/login")
      .send(falseAdminPass)
      .set("Accept", "Application/JSON")
      .end((err, res) => {
        res.body.should.have.status(400);
        res.body.should.have.property("status").eql(400);
        res.body.should.have.property("error").eql("incorrect password");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should login the admin", (done) => {
    chai.request(server)
      .post("/api/v2/auth/login")
      .send(admin)
      .set("Accept", "Application/JSON")
      .end((err, res) => {
        adminToken = "Bearer " + res.body.token;
        res.body.should.have.status(200);
        res.body.should.have.property("status").eql(200);
        res.body.should.have.property("success").eql("logged in");
        res.body.should.have.property("token");
        res.body.should.be.a("object");
        res.body.data.should.be.a("array");
        done();
      });
  });

  it("Should retrieve registered users", (done) => {
    chai.request(server)
      .get("/api/v2/users")
      .set("authorization", adminToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("status").eql(200);
        res.body.should.have.property("success").eql("users retrieved");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should retrieve a specific user of id = 2", (done) => {
    chai.request(server)
      .get("/api/v2/users/2")
      .set("authorization", adminToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("status").eql(200);
        res.body.should.have.property("success").eql("user retrieved");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should not retrieve the user of id = 20, because they don't exist", (done) => {
    chai.request(server)
      .get("/api/v2/users/20")
      .set("authorization", adminToken)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("status").eql(404);
        res.body.should.have.property("error").eql("user with the specified id, not found");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should not reset a password of an invalid email", (done) => {
    chai.request(server)
      .post("/api/v2/auth/reset")
      .send(falsePassReset)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("status").eql(404);
        res.body.should.have.property("error").eql("invalid email");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should reset a password of a specific user of id = 3", (done) => {
    chai.request(server)
      .post("/api/v2/auth/reset")
      .send(passReset)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("status").eql(200);
        res.body.should.have.property("data");
        res.body.should.be.a("object");
        res.body.data.should.be.a("array");
        done();
      });
  });

  it("Should retrieve users who reset their passwords", (done) => {
    chai.request(server)
      .get("/api/v2/auth/reset")
      .set("authorization", adminToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("status").eql(200);
        res.body.should.have.property("success").eql("admin, the users who reset their passwords are retrieved");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should not login the second new user, because they will have reset their password", (done) => {
    chai.request(server)
      .post("/api/v2/auth/login")
      .send(newUserLogIn2)
      .set("Accept", "Application/JSON")
      .end((err, res) => {
        res.body.should.have.status(404);
        res.body.should.have.property("status").eql(404);
        res.body.should.have.property("error").eql("sorry! you have recently reset your password. "
        + "check your email for the password reset link");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should delete a specific user of id = 2", (done) => {
    chai.request(server)
      .delete("/api/v2/users/2")
      .set("authorization", adminToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("status").eql(200);
        res.body.should.have.property("success").eql("user deleted");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should delete a specific user of id = 3", (done) => {
    chai.request(server)
      .delete("/api/v2/users/3")
      .set("authorization", adminToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("status").eql(200);
        res.body.should.have.property("success").eql("user deleted");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should not delete the user of id = 3, because they will have been already deleted", (done) => {
    chai.request(server)
      .delete("/api/v2/users/3")
      .set("authorization", adminToken)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("status").eql(404);
        res.body.should.have.property("error").eql("user with the specified id, not found");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should not retrieve users who reset their passwords, because they will have been deleted", (done) => {
    chai.request(server)
      .get("/api/v2/auth/reset")
      .set("authorization", adminToken)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("status").eql(404);
        res.body.should.have.property("error").eql("admin, there are no users who reset their passwords");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should delete the admin", (done) => {
    chai.request(server)
      .delete("/api/v2/users/1")
      .set("authorization", adminToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("status").eql(200);
        res.body.should.have.property("success").eql("user deleted");
        res.body.should.be.a("object");
        done();
      });
  });

  it("Should not retrieve registered users, because they will have been deleted", (done) => {
    chai.request(server)
      .get("/api/v2/users")
      .set("authorization", adminToken)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("status").eql(404);
        res.body.should.have.property("error").eql("no users found");
        res.body.should.be.a("object");
        done();
      });
  });

  database("TRUNCATE TABLE users CASCADE; ALTER SEQUENCE users_id_seq RESTART WITH 1;");
});
