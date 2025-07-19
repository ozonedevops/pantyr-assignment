import { buildSchema } from 'graphql';

export default buildSchema(`
  type Product {
    id: Int!
    title: String!
    price: Float!
    stock: Int!
  }

  type ProductEdge {
    cursor: String!
    node: Product!
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type ProductConnection {
    edges: [ProductEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  input ProductFilterInput {
    titleContains: String
    minPrice: Float
    maxPrice: Float
  }

  enum ProductSortField {
    price
    title
  }

  enum SortDirection {
    asc
    desc
  }

  input ProductSortInput {
    field: ProductSortField!
    direction: SortDirection!
  }

  input ProductOrderInput {
    id: Int!
    quantity: Int!
  }

  type Order {
    id: Int!
    products: [Int!]!
    orderedBy: String!
  }

  input AddProductInput {
    title: String!
    price: Float!
    stock: Int!
  }

  type StoreMetrics {
  totalOrders: Int!
  totalRevenue: Float!
  }

  type Query {
    products(first: Int!, after: String, filter: ProductFilterInput, sort: ProductSortInput): ProductConnection!
    product(id: Int!): Product
    ordersByUser(name: String!): [Order!]!
    lowStockProducts(threshold: Int = 10): [Product!]!
    metrics: StoreMetrics!
  }

  type Mutation {
    placeOrder(products: [ProductOrderInput!]!, orderedBy: String!): Order!
    updateProductStock(productId: Int!, stock: Int!): Product!
    updateProductPrice(productId: Int!, price: Float!): Product!
    updateProductTitle(productId: Int!, title: String!): Product!
    addProduct(input: AddProductInput!): Product!
  }
`);
