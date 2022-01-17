import { gql } from "apollo-server-lambda";

export default gql`
  type User {
    userID: String!
    name: String!
    title: String!
    todos: [Todo!]!
  }

  input UserInput {
    name: String!
    title: String!
  }

  type Query {
    getUsers: [User!]!
  }

  type Mutation {
    createUser(data: UserInput!): User!
  }
`
