export interface APIError {
  message: string;
  extensions?: {
    code: number;
    message: string;
  };
}

export interface Product {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  product_url: string;
  rating: number;
}

export interface ProductsResponse {
  data?: {
    getProductsList: {
      data: Product[];
      totalCount: number;
    };
  };
  errors?: APIError[];
}

export interface ShopeeConfig {
  appId: string;
  appSecret: string;
}

export class ShopeeAffiliateClient {
  constructor(private config: ShopeeConfig) {}

  async getProducts(params: { limit?: number; offset?: number; category?: string }): Promise<ProductsResponse> {
    const query = `
      query {
        getProductsList(input: {
          offset: ${params.offset || 0},
          limit: ${params.limit || 20}
        }) {
          data {
            name
            description
            price
            stock
            image
            product_url
            rating
          }
          totalCount
        }
      }
    `;

    try {
      const response = await fetch("/api/shopee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query,
          variables: params
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as ProductsResponse;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }
}
