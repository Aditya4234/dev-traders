interface ElasticsearchConfig {
  node: string;
  auth?: { username: string; password: string };
}

let client: any = null;

async function getClient(): Promise<any> {
  if (client) return client;

  const node = process.env.ELASTICSEARCH_URL;
  if (!node) return null;

  try {
    const { Client } = await import("@elastic/elasticsearch");
    const config: ElasticsearchConfig = { node };

    if (process.env.ELASTICSEARCH_USERNAME) {
      config.auth = {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD || "",
      };
    }

    client = new Client(config);
    const health = await client.cluster.health();
    console.log(`[Elasticsearch] Connected — status: ${health.status}`);
    return client;
  } catch (err) {
    console.error("[Elasticsearch] Failed to connect:", (err as Error).message);
    return null;
  }
}

export async function indexProduct(product: any): Promise<void> {
  const es = await getClient();
  if (!es) return;
  try {
    await es.index({
      index: "products",
      id: product._id?.toString() || product.id,
      document: {
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        discountPrice: product.discountPrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        badge: product.badge,
        sizes: product.sizes,
        isActive: product.isActive,
        createdAt: product.createdAt,
      },
    });
  } catch (err) {
    console.error("[Elasticsearch] Index error:", (err as Error).message);
  }
}

export async function searchProducts(query: string, options: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  from?: number;
  size?: number;
} = {}): Promise<{ products: any[]; total: number }> {
  const es = await getClient();
  if (!es) return { products: [], total: 0 };

  try {
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ["name^3", "brand^2", "category^2"],
          fuzziness: "AUTO",
        },
      },
    ];

    const filter: any[] = [{ term: { isActive: true } }];

    if (options.category) {
      filter.push({ match: { category: options.category } });
    }

    if (options.minPrice || options.maxPrice) {
      const range: any = {};
      if (options.minPrice) range.gte = options.minPrice;
      if (options.maxPrice) range.lte = options.maxPrice;
      filter.push({ range: { discountPrice: range } });
    }

    let sort: any[] = [];
    switch (options.sort) {
      case "price_asc":
        sort = [{ discountPrice: { order: "asc" } }];
        break;
      case "price_desc":
        sort = [{ discountPrice: { order: "desc" } }];
        break;
      case "rating":
        sort = [{ rating: { order: "desc" } }];
        break;
      case "relevance":
      default:
        sort = ["_score"];
    }

    const result = await es.search({
      index: "products",
      query: { bool: { must, filter } },
      sort,
      from: options.from || 0,
      size: options.size || 50,
    });

    return {
      products: result.hits.hits.map((hit: any) => ({
        _id: hit._id,
        ...hit._source,
        score: hit._score,
      })),
      total: typeof result.hits.total === "number"
        ? result.hits.total
        : result.hits.total?.value || 0,
    };
  } catch (err) {
    console.error("[Elasticsearch] Search error:", (err as Error).message);
    return { products: [], total: 0 };
  }
}

export async function indexAllProducts(products: any[]): Promise<void> {
  const es = await getClient();
  if (!es) return;

  try {
    const exists = await es.indices.exists({ index: "products" });
    if (exists) {
      await es.indices.delete({ index: "products" });
    }

    await es.indices.create({
      index: "products",
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        analysis: {
          analyzer: {
            autocomplete: {
              tokenizer: "autocomplete",
              filter: ["lowercase"],
            },
          },
          tokenizer: {
            autocomplete: {
              type: "edge_ngram",
              min_gram: 2,
              max_gram: 20,
              token_chars: ["letter", "digit"],
            },
          },
        },
      },
      mappings: {
        properties: {
          name: { type: "text", analyzer: "autocomplete", search_analyzer: "standard" },
          brand: { type: "keyword" },
          category: { type: "keyword" },
          price: { type: "number" },
          discountPrice: { type: "number" },
          rating: { type: "number" },
          reviewCount: { type: "number" },
          badge: { type: "keyword" },
          sizes: { type: "keyword" },
          isActive: { type: "boolean" },
          createdAt: { type: "date" },
        },
      },
    });

    const ops = products.flatMap((p) => [
      { index: { _index: "products", _id: p._id?.toString() || p.id } },
      {
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        discountPrice: p.discountPrice,
        rating: p.rating,
        reviewCount: p.reviewCount,
        badge: p.badge,
        sizes: p.sizes,
        isActive: p.isActive,
        createdAt: p.createdAt,
      },
    ]);

    if (ops.length > 0) {
      const result = await es.bulk({ operations: ops });
      console.log(`[Elasticsearch] Indexed ${products.length} products`);
      if (result.errors) {
        console.error("[Elasticsearch] Bulk indexing had errors");
      }
    }
  } catch (err) {
    console.error("[Elasticsearch] Bulk index error:", (err as Error).message);
  }
}

export async function deleteProductIndex(productId: string): Promise<void> {
  const es = await getClient();
  if (!es) return;
  try {
    await es.delete({ index: "products", id: productId });
  } catch (err) {
    console.error("[Elasticsearch] Delete error:", (err as Error).message);
  }
}
