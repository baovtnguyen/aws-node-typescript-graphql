import { gql } from "apollo-server-lambda";

export default gql`
  type Todo {
    pk: String!
    sk: String!
    content: String!
    isCompleted: Boolean!
  }

  input TodoInput {
    content: String!
    isCompleted: Boolean = false
  }

  type Query {
    hello: String
    getTodos: [Todo!]!
  }

  type Mutation {
    createTodo: String
  }
`
