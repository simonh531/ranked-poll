import { gql } from '@apollo/client';

export default gql`
  enum Protection {
    cookie_id
    ip
    user_id
    none
  }

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
    color: [Int]!
    randomize: Boolean!
    protection: Protection!
  }

  input VoteInput {
    user: ID
    pollId: ID!
    vote: [String]!
    lowVote: [String]!
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
    color: [Int]!
    randomize: Boolean!
    createdAt: String!
    deletedAt: String
    editedAt: String
    count: Int!
    cookieCount: Int!
    ipCount: Int
    userCount: Int
    protection: Protection
  }

  type VoteData {
    vote: [String]!
    lowVote: [String]!
    count: Int!
  }

  type Query {
    user(id: ID!): User!
    users: [User]!
    viewer: User
    poll(id: ID!): Poll!
    pollResult(id: ID!, protection: Protection!): [VoteData]!
  }

  type Mutation {
    signUp(input: SignUpInput!): SignUpPayload!
    signIn(input: SignInInput!): SignInPayload!
    signOut: Boolean!
    createPoll(input: CreatePollInput!): Poll!
    vote(input: VoteInput!): Boolean!
  }
`;
