const Joi = require('joi');
const {ModelUtils} = require('isomorphic-core');
const {createAndReplyWithSyncbackRequest} = require('../route-helpers');


// const recipient = Joi.object().keys({
//   name: Joi.string().required(),
//   email: Joi.string().email().required(),
//   // Rest are optional
//   account_id: Joi.string(),
//   client_id: Joi.string(),
//   id: Joi.string(),
//   thirdPartyData: Joi.object(),
//   server_id: Joi.string(),
//   object: Joi.string(),
// });

// const recipientList = Joi.array().items(recipient);

module.exports = (server) => {
  server.route({
    method: 'POST',
    path: '/send',
    config: {
    },
    async handler(request, reply) {
      createAndReplyWithSyncbackRequest(request, reply, {
        type: "SendMessage",
        props: {
          messagePayload: request.payload,
        },
      })
    },
  });

  // Initiates a multi-send session by creating a new multi-send draft.
  server.route({
    method: 'POST',
    path: '/send-per-recipient',
    config: {
    },
    async handler(request, reply) {
      createAndReplyWithSyncbackRequest(request, reply, {
        type: "SendMessagePerRecipient",
        props: {
          messagePayload: request.payload.message,
          usesOpenTracking: request.payload.uses_open_tracking,
          usesLinkTracking: request.payload.uses_link_tracking,
        },
      })
    },
  });

  // Closes out a multi-send session by marking the sending draft as sent
  // and moving it to the user's Sent folder.
  server.route({
    method: 'POST',
    path: '/ensure-message-in-sent-folder/{messageId}',
    config: {
      validate: {
        payload: {
          customSentMessage: Joi.boolean(),
        },
        params: {
          messageId: Joi.string(),
        },
      },
    },
    async handler(request, reply) {
      const {messageId} = request.params;
      const {customSentMessage} = request.payload;

      if (!ModelUtils.isValidId(messageId)) {
        reply.badRequest(`messageId is not a base-36 integer`)
        return
      }
      createAndReplyWithSyncbackRequest(request, reply, {
        type: "EnsureMessageInSentFolder",
        props: { messageId, customSentMessage },
      })
    },
  });
};
