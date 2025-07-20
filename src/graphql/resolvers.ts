
import { getProducts, saveProducts, getOrders, saveOrders } from '../services/productService';
import { IOrder } from '../interfaces/order';
import { IProduct } from '../interfaces/product';
import type { ProductMultiOrderInput } from '../interfaces/productMultiOrderInput';

let orderId = 1;

const resolvers = {
  async products({ first, after, filter, sort }: any) {
    const allProducts = await getProducts();
    let filtered = [...allProducts];

    if (filter?.titleContains)
      filtered = filtered.filter(p => p.title.toLowerCase().includes(filter.titleContains.toLowerCase()));
    if (filter?.minPrice !== undefined)
      filtered = filtered.filter(p => p.price >= filter.minPrice);
    if (filter?.maxPrice !== undefined)
      filtered = filtered.filter(p => p.price <= filter.maxPrice);

    if (sort) {
      filtered.sort((a: any, b: any) => {
        const field = sort.field;
        const dir = sort.direction === 'asc' ? 1 : -1;
        return a[field] > b[field] ? dir : -dir;
      });
    }

    const startIndex = after ? filtered.findIndex(p => p.id === parseInt(Buffer.from(after, 'base64').toString())) + 1 : 0;
    const sliced = filtered.slice(startIndex, startIndex + first);
    const edges = sliced.map(p => ({
      cursor: Buffer.from(p.id.toString()).toString('base64'),
      node: p,
    }));

    return {
      edges,
      pageInfo: {
        endCursor: edges.length ? edges[edges.length - 1].cursor : null,
        hasNextPage: startIndex + first < filtered.length,
      },
      totalCount: filtered.length,
    };
  },

  async product({ id }: { id: number }): Promise<IProduct | null> {
    const products = await getProducts();
    return products.find(p => p.id === id) ?? null;
  },

  async ordersByUser({ name }: { name: string }): Promise<IOrder[]> {
    const orders = await getOrders();
    return orders.filter(o => o.orderedBy.toLowerCase() === name.toLowerCase());
  },

  async lowStockProducts({ threshold = 10 }: { threshold?: number }): Promise<IProduct[]> {
    const products = await getProducts();
    return products.filter(p => p.stock <= threshold);
  },

  async metrics(): Promise<{ totalOrders: number; totalRevenue: number }> {
    const orders = await getOrders();
    const products = await getProducts();
    const productMap = new Map(products.map(p => [p.id, p]));
    let revenue = 0;
    for (const order of orders) {
      for (const id of order.products) {
        const p = productMap.get(id);
        if (p) revenue += p.price;
      }
    }
    return {
      totalOrders: orders.length,
      totalRevenue: parseFloat(revenue.toFixed(2)),
    };
  },

  async placeOrder({ products, orderedBy }: any): Promise<IOrder> {
    const allProducts = await getProducts();
    const allOrders = await getOrders();
    const productMap = new Map<number, IProduct>();
    allProducts.forEach(p => productMap.set(p.id, p));

    for (const { id, quantity } of products) {
      const product = productMap.get(id);
      if (!product) throw new Error(`Product ID ${id} not found`);
      if (product.stock < quantity)
        throw new Error(`Not enough stock for product ${product.title}`);
      product.stock -= quantity;
    }

    await saveProducts(allProducts);

    const newOrder: IOrder = {
      id: allOrders.length + 1,
      products: products.flatMap((p: any) => Array(p.quantity).fill(p.id)),
      orderedBy,
    };

    allOrders.push(newOrder);
    await saveOrders(allOrders);

    return newOrder;
  },

  async placeMultiOrder(args: { products: ProductMultiOrderInput[]; orderedBy: string }): Promise<IOrder> {
    try {
      const { products, orderedBy } = args;
      if (!Array.isArray(products) || products.length === 0) {
        throw new Error('products must be a non-empty array');
      }
      if (typeof orderedBy !== 'string' || orderedBy.trim() === '') {
        throw new Error('orderedBy must be a non-empty string');
      }

      const allProducts = await getProducts();
      const allOrders = await getOrders();
      const productMap = new Map(allProducts.map(p => [p.id, p]));

      for (const { productId, quantity } of products) {
        if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
          throw new Error(`Invalid product input: productId=${productId}, quantity=${quantity}`);
        }
        const product = productMap.get(productId);
        if (!product) throw new Error(`Product ID ${productId} not found`);
        if (product.stock < quantity) throw new Error(`Insufficient stock for "${product.title}"`);
        product.stock -= quantity;
      }

      await saveProducts(allProducts);

      const newOrder: IOrder = {
        id: allOrders.length + 1,
        products: products.flatMap(p => Array(p.quantity).fill(p.productId)),
        orderedBy: orderedBy.trim(),
      };

      allOrders.push(newOrder);
      await saveOrders(allOrders);

      return newOrder;
    } catch (err: any) {
      console.error('placeMultiOrder error:', err);
      throw new Error('placeMultiOrder failed: ' + err.message);
    }
  },

  async updateProductStock({ productId, stock }: { productId: number; stock: number }): Promise<IProduct> {
    const products = await getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error(`Product ID ${productId} not found`);
    if (stock < 0 || !Number.isInteger(stock)) throw new Error("Stock must be a non-negative integer");
    product.stock = stock;
    await saveProducts(products);
    return product;
  },

  async updateProductPrice({ productId, price }: { productId: number; price: number }): Promise<IProduct> {
    const products = await getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error(`Product ID ${productId} not found`);
    if (price < 0) throw new Error("Price must be non-negative");
    product.price = price;
    await saveProducts(products);
    return product;
  },

  async updateProductTitle({ productId, title }: { productId: number; title: string }): Promise<IProduct> {
    const products = await getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error(`Product ID ${productId} not found`);
    if (!title || title.trim() === '') throw new Error("Title is required");
    product.title = title;
    await saveProducts(products);
    return product;
  },

  async addProduct({ input }: { input: { title: string; price: number; stock: number } }): Promise<IProduct> {
    const { title, price, stock } = input;
    if (!title || title.trim() === '') throw new Error("Title is required");
    if (price < 0) throw new Error("Price must be non-negative");
    if (stock < 0 || !Number.isInteger(stock)) throw new Error("Stock must be a non-negative integer");

    const products = await getProducts();
    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct: IProduct = {
      id: nextId,
      title: title.trim(),
      price,
      stock,
    };

    products.push(newProduct);
    await saveProducts(products);
    return newProduct;
  }
};

export default resolvers;
