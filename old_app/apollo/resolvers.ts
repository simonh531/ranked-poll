// import { AuthenticationError, UserInputError } from 'apollo-server-micro';
// import { createUser, findUser, validatePassword } from '../lib/user';
// import { setLoginSession, getLoginSession } from '../lib/auth';
// import { removeTokenCookie } from '../lib/auth-cookies';

export default {
  Query: {
    // async viewer(_parent, _args, context /* , _info */) {
    //   try {
    //     const session = await getLoginSession(context.req);

    //     if (session) {
    //       return findUser({ email: session.email });
    //     }
    //     return null;
    //   } catch (error) {
    //     throw new AuthenticationError(
    //       'Authentication token is invalid, please log in',
    //     );
    //   }
    // },
    poll(_source, { id }, {
      dataSources,
    }) {
      return dataSources.postgres.getPoll(id);
    },
    pollResult(_source, { id, protection }, { dataSources }) {
      return dataSources.postgres.getPollResult(id, protection);
    },
  },
  Mutation: {
    // async signUp(_parent, args, _context, _info) {
    //   const user = await createUser(args.input);
    //   return { user };
    // },
    // async signIn(_parent, args, context, _info) {
    //   const user = await findUser({ email: args.input.email });

    //   if (user && (await validatePassword(user, args.input.password))) {
    //     const session = {
    //       id: user.id,
    //       email: user.email,
    //     };

    //     await setLoginSession(context.res, session);

    //     return { user };
    //   }

    //   throw new UserInputError('Invalid email and password combination');
    // },
    // async signOut(_parent, _args, context, _info) {
    //   removeTokenCookie(context.res);
    //   return true;
    // },

    createPoll(_source, { input }, { dataSources }) {
      const {
        owner, title, description, options, color, randomize, protection,
      } = input;
      return dataSources.postgres.createPoll(
        owner,
        title,
        description,
        options,
        color,
        randomize,
        protection,
      );
    },

    vote(_source, { input }, {
      dataSources, ip, cookieId,
    }) {
      const {
        user, pollId, vote, lowVote,
      } = input;

      return dataSources.postgres.vote(pollId, user, cookieId, ip, vote, lowVote);
    },
  },
};
