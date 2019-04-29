/* eslint-disable no-restricted-globals */
/* eslint-disable max-len */
/* eslint-disable no-dupe-keys */
/* eslint-disable no-shadow */
import dotenv from 'dotenv';
import moment from 'moment';
import Group from '../models/group';
import Member from '../models/member';
import Groupmessage from '../models/group-message';
import database from '../db/database';
import sql from '../helpers/sql';

dotenv.config();

const groups = {
  /**
   * create group endpoint
   * @param {object} req
   * @param {object} res
   */
  createGroup(req, res) {
    const {
      name, role,
    } = req.body;
    const user = req.userEmail;
    const findGroup = database(sql.findGroup, [name, user]);
    findGroup.then((response) => {
      if (response.length !== 0) {
        res.status(400).json({ status: 400, error: 'group with the specified name already exists' });
      } else {
        const owner = user;
        const group = new Group(name, role, owner);
        const query = database(sql.createGroup, [group.name, group.role, group.owner]);
        query.then((response) => {
          const {
            id, name, role,
          } = response[0];
          res.status(201).json({
            status: 201,
            success: 'group created',
            data: [{
              id, name, role,
            }],
          });
        });
      }
    });
  },

  /**
   * retrieve all groups endpoint
   * @param {object} req
   * @param {object} res
   */
  retrieveGroups(req, res) {
    const user = req.userEmail;
    const userAccess = 'true';
    const findAdmin = database(sql.retrieveAdmin, [user, userAccess]);
    findAdmin.then((response) => {
      if (response.length !== 0) {
        const allGroups = database(sql.retrieveAllGroups);
        allGroups.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({
              status: 404,
              error: 'admin, no groups found',
            });
          } else {
            res.status(200).json({
              status: 200,
              success: 'admin, groups retrieved',
              data: response,
            });
          }
        });
      } else {
        const userGroups = database(sql.retrieveUserGroups, [user]);
        userGroups.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'no groups found' });
          } else {
            res.status(200).json({
              status: 200,
              success: 'groups retrieved',
              data: response,
            });
          }
        });
      }
    });
  },

  /**
   * retrieve a single group endpoint
   * @param {object} req
   * @param {object} res
   */
  retrieveGroup(req, res) {
    const groupId = req.params.id;
    const user = req.userEmail;
    const userAccess = 'true';
    const findAdmin = database(sql.retrieveAdmin, [user, userAccess]);
    findAdmin.then((response) => {
      if (response.length !== 0) {
        const specificGroup = database(sql.retrieveSpecificGroup, [groupId]);
        specificGroup.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'admin, group not found' });
          } else {
            res.status(200).json({
              status: 200,
              success: 'admin, group retrieved',
              data: response,
            });
          }
        });
      } else {
        const userGroup = database(sql.retrieveUserGroup, [groupId, user]);
        userGroup.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'group not found' });
          } else {
            const specificGroup = database(sql.retrieveSpecificGroup, [groupId]);
            specificGroup.then((response) => {
              if (response.length === 0 || response.length === 'undefined') {
                res.status(404).json({ status: 404, error: 'group not found' });
              } else {
                res.status(200).json({
                  status: 200,
                  success: 'group retrieved',
                  data: response,
                });
              }
            });
          }
        });
      }
    });
  },

  /**
   * change group name endpoint
   * @param {object} req
   * @param {object} res
   */
  changeGroupName(req, res) {
    const groupId = req.params.id;
    const {
      name,
    } = req.body;
    const user = req.userEmail;
    const userAccess = 'true';
    const findAdmin = database(sql.retrieveAdmin, [user, userAccess]);
    findAdmin.then((response) => {
      if (response.length !== 0) {
        const specificGroup = database(sql.retrieveSpecificGroup, [groupId]);
        specificGroup.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'admin, group with the specified id, not found' });
          } else {
            const query = database(sql.updateSpecificGroup, [name, groupId]);
            query.then((response) => {
              const {
                id, name, role,
              } = response[0];
              res.status(200).json({
                status: 200,
                success: 'admin, group name changed',
                data: {
                  id, name, role,
                },
              });
            });
          }
        });
      } else {
        const userGroup = database(sql.retrieveUserGroup, [groupId, user]);
        userGroup.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'group not found' });
          } else {
            const findGroup = database(sql.findGroup, [name, user]);
            findGroup.then((response) => {
              if (response.length !== 0 || response.length === 'undefined') {
                res.status(400).json({ status: 400, error: 'the specified group name is already taken' });
              } else {
                const query = database(sql.updateSpecificGroup, [name, groupId]);
                query.then((response) => {
                  const {
                    id, name, role,
                  } = response[0];
                  res.status(200).json({
                    status: 200,
                    success: 'group name changed',
                    data: {
                      id, name, role,
                    },
                  });
                });
              }
            });
          }
        });
      }
    });
  },

  /**
   * delete a single group endpoint
   * @param {object} req
   * @param {object} res
   */
  deleteGroup(req, res) {
    const groupId = req.params.id;
    const user = req.userEmail;
    const userAccess = 'true';
    const findAdmin = database(sql.retrieveAdmin, [user, userAccess]);
    findAdmin.then((response) => {
      if (response.length !== 0) {
        const specificGroup = database(sql.retrieveSpecificGroup, [groupId]);
        specificGroup.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'admin, group not found' });
          } else {
            const query = database(sql.deleteSpecificGroup, [groupId]);
            query.then((response) => {
              if (response) {
                res.status(200).json({ status: 200, success: 'admin, group deleted' });
              } else {
                res.status(400).json({ status: 400, error: 'admin, group not deleted' });
              }
            });
          }
        });
      } else {
        const userGroup = database(sql.retrieveUserGroup, [groupId, user]);
        userGroup.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'group not found' });
          } else {
            const query = database(sql.deleteSpecificGroup, [groupId]);
            query.then((response) => {
              if (response) {
                res.status(200).json({ status: 200, success: 'group deleted' });
              } else {
                res.status(400).json({ status: 400, error: 'group not deleted' });
              }
            });
          }
        });
      }
    });
  },

  /**
   * register group member endpoint
   * @param {object} req
   * @param {object} res
   */
  addGroupMember(req, res) {
    const groupId = req.params.id;
    const {
      username, email,
    } = req.body;
    const usernameArr = Array.from(username);
    if (!isNaN(usernameArr[0])) {
      res.status(400).json({ error: 'username must not start with a number' });
    } else {
      const owner = req.userEmail;
      const specificGroupOwner = database(sql.retrieveSpecificGroupOwner, [groupId, owner]);
      specificGroupOwner.then((response) => {
        if (response.length === 0 || response.length === 'undefined') {
          res.status(404).json({ status: 404, error: 'group not found' });
        } else {
          const findUser = database(sql.retrieveSpecificUser, [email]);
          findUser.then((response) => {
            if (response.length !== 0) {
              const findMember = database(sql.retrieveMember, [email, groupId]);
              findMember.then((response) => {
                if (response.length !== 0) {
                  res.status(400).json({ status: 400, error: 'user with the specified email is already registered as a group member' });
                } else {
                  const memberGroup = groupId;
                  const member = new Member(username, email, memberGroup);
                  const query = database(sql.registerGroupMember, [member.username, member.email, member.memberGroup]);
                  query.then((response) => {
                    const {
                      id, username, email, groupid,
                    } = response[0];
                    res.status(201).json({
                      status: 201,
                      success: 'group member registered',
                      data: [{
                        id, username, email, groupid,
                      }],
                    });
                  });
                }
              });
            } else {
              res.status(404).json({ status: 404, error: 'user with the specified email is not even registered. the email is invalid' });
            }
          });
        }
      });
    }
  },

  /**
   * retrieve all group members endpoint
   * @param {object} req
   * @param {object} res
   */
  retrieveGroupMembers(req, res) {
    const groupId = req.params.id;
    const user = req.userEmail;
    const userAccess = 'true';
    const findAdmin = database(sql.retrieveAdmin, [user, userAccess]);
    findAdmin.then((response) => {
      if (response.length !== 0) {
        const specificGroup = database(sql.retrieveSpecificGroup, [groupId]);
        specificGroup.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'admin, group not found' });
          } else {
            const groupMembers = database(sql.retrieveSpecificGroupMembers, [groupId]);
            groupMembers.then((response) => {
              if (response.length === 0 || response.length === 'undefined') {
                res.status(404).json({ status: 404, error: 'admin, no group members found' });
              } else {
                res.status(404).json({
                  status: 404,
                  error: 'admin, group members retrieved',
                  data: response,
                });
              }
            });
          }
        });
      } else {
        const userGroup = database(sql.retrieveUserGroup, [groupId, user]);
        userGroup.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'group not found' });
          } else {
            const specificGroup = database(sql.retrieveSpecificGroup, [groupId]);
            specificGroup.then((response) => {
              if (response.length === 0 || response.length === 'undefined') {
                res.status(404).json({ status: 404, error: 'group not found' });
              } else {
                const groupMembers = database(sql.retrieveSpecificGroupMembers, [groupId]);
                groupMembers.then((response) => {
                  if (response.length === 0 || response.length === 'undefined') {
                    res.status(404).json({ status: 404, error: 'no group members found' });
                  } else {
                    res.status(200).json({
                      status: 200,
                      success: 'group members retrieved',
                      data: response,
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  },

  /**
   * retrieve a single group member endpoint
   * @param {object} req
   * @param {object} res
   */
  retrieveGroupMember(req, res) {
    const groupId = req.params.id;
    const groupMemberId = req.params.mid;
    const owner = req.userEmail;
    const specificGroupOwner = database(sql.retrieveSpecificGroupOwner, [groupId, owner]);
    specificGroupOwner.then((response) => {
      if (response.length === 0 || response.length === 'undefined') {
        res.status(404).json({ status: 404, error: 'group not found' });
      } else {
        const specificGroupMember = database(sql.retrieveSpecificGroupMember, [groupMemberId, groupId]);
        specificGroupMember.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'group member not found' });
          } else {
            const query = database(sql.retrieveSpecificGroupMember, [groupMemberId, groupId]);
            query.then((response) => {
              if (response) {
                res.status(200).json({ status: 200, success: 'group member retrieved', response });
              } else {
                res.status(400).json({ status: 400, error: 'group member not retrieved' });
              }
            });
          }
        });
      }
    });
  },

  /**
   * delete a single group member endpoint
   * @param {object} req
   * @param {object} res
   */
  deleteGroupMember(req, res) {
    const groupId = req.params.id;
    const groupMemberId = req.params.mid;
    const owner = req.userEmail;
    const specificGroupOwner = database(sql.retrieveSpecificGroupOwner, [groupId, owner]);
    specificGroupOwner.then((response) => {
      if (response.length === 0 || response.length === 'undefined') {
        res.status(404).json({ status: 404, error: 'group not found' });
      } else {
        const specificGroupMember = database(sql.retrieveSpecificGroupMember, [groupMemberId, groupId]);
        specificGroupMember.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'group member not found' });
          } else {
            const query = database(sql.deleteSpecificGroupMember, [groupMemberId, groupId]);
            query.then((response) => {
              if (response) {
                res.status(200).json({ status: 200, success: 'group member deleted' });
              }
            });
          }
        });
      }
    });
  },

  /**
   * send group email endpoint
   * @param {object} req
   * @param {object} res
   */
  sendGroupEmail(req, res) {
    const groupId = req.params.id;
    const {
      subject, message, parentMessageId,
    } = req.body;
    const owner = req.userEmail;
    const specificGroupOwner = database(sql.retrieveSpecificGroupOwner, [groupId, owner]);
    specificGroupOwner.then((response) => {
      if (response.length === 0 || response.length === 'undefined') {
        res.status(404).json({ status: 404, error: 'group not found' });
      } else {
        const groupmessage = new Groupmessage(subject, message, parentMessageId, groupId);
        const query = database(sql.sendGroupEmail, [groupmessage.subject, groupmessage.message, groupmessage.parentMessageId, moment().format('LL'), groupmessage.groupId]);
        query.then((response) => {
          const {
            id, subject, message, parentmessageid, groupid, createdon,
          } = response[0];
          res.status(201).json({
            status: 201,
            success: 'group email sent',
            data: [{
              id, subject, message, parentmessageid, groupid, createdon,
            }],
          });
        });
      }
    });
  },

  /**
   * retrieve all group emails endpoint
   * @param {object} req
   * @param {object} res
   */
  retrieveGroupEmails(req, res) {
    const groupId = req.params.id;
    const user = req.userEmail;
    const userAccess = 'true';
    const findAdmin = database(sql.retrieveAdmin, [user, userAccess]);
    findAdmin.then((response) => {
      if (response.length !== 0) {
        const specificGroup = database(sql.retrieveSpecificGroup, [groupId]);
        specificGroup.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            res.status(404).json({ status: 404, error: 'admin, group not found' });
          } else {
            const groupEmails = database(sql.retrieveSpecificGroupEmails, [groupId]);
            groupEmails.then((response) => {
              if (response.length === 0 || response.length === 'undefined') {
                res.status(404).json({ status: 404, error: 'admin, no group emails found' });
              } else {
                res.status(200).json({
                  status: 200,
                  success: 'admin, group emails found',
                  data: response,
                });
              }
            });
          }
        });
      } else {
        const userGroup = database(sql.retrieveUserGroup, [groupId, user]);
        userGroup.then((response) => {
          if (response.length === 0 || response.length === 'undefined') {
            const findMember = database(sql.retrieveSpecificGroupMember, [user, groupId]);
            findMember.then((response) => {
              if (response.length === 0) {
                res.status(404).json({ status: 404, error: 'you are not a member of the group' });
              } else {
                const memberEmails = database(sql.retrieveMemberEmails, [groupId]);
                memberEmails.then((response) => {
                  if (response.length === 0 || response.length === 'undefined') {
                    res.status(404).json({ status: 404, error: 'no group emails found' });
                  } else {
                    res.status(200).json({
                      status: 200,
                      success: 'group emails found',
                      data: response,
                    });
                  }
                });
              }
            });
          } else {
            const groupEmails = database(sql.retrieveSpecificGroupEmails, [groupId]);
            groupEmails.then((response) => {
              if (response.length === 0 || response.length === 'undefined') {
                res.status(404).json({ status: 404, error: 'no group emails found' });
              } else {
                res.status(200).json({
                  status: 200,
                  success: 'group emails found',
                  data: response,
                });
              }
            });
          }
        });
      }
    });
  },
};

export default groups;
