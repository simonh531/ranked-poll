import { gql } from '@apollo/client';

export default gql`
  type User {
    id: ID!
    email: String!
    createdAt: Int!
  }

  input SignUpInput {
    email: String!
    password: String!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  input CreatePollInput {
    owner: ID
    title: String!
    description: String
    options: [String]!
  }

  input VoteInput {
    user: ID
    pollId: ID!
    vote: [String]!
  }

  type SignUpPayload {
    user: User!
  }

  type SignInPayload {
    user: User!
  }

  type Poll {
    id: ID!
    owner: ID
    title: String!
    description: String
    options: [String]!
    createdAt: String!
    deletedAt: String
    editedAt: String
    count: Int!
  }

  type VoteData {
    vote: [String]!
    count: Int!
  }

  type Query {
    user(id: ID!): User!
    users: [User]!
    viewer: User
    poll(id: ID!): Poll!
    pollResult(id: ID!): [VoteData]!
  }

  type Mutation {
    signUp(input: SignUpInput!): SignUpPayload!
    signIn(input: SignInInput!): SignInPayload!
    signOut: Boolean!
    createPoll(input: CreatePollInput!): Poll!
    vote(input: VoteInput!): Boolean!
  }
`;
