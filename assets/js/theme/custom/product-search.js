import PageManager from '../page-manager';

export default class searchProducts extends PageManager {
    constructor(context) {
        super(context);
        this.context = context;
        this.init();
    }

    init() {
        const fetchAllProducts = async (searchTerm) => {
            const token = this.context?.token;
            const query = `
                query ProductSearch($searchTerm: String!, $first: Int!) {
                    site {
                        search {
                            searchProducts(filters: {searchTerm: $searchTerm}) {
                                products(first: $first) {
                                    edges {
                                        node {
                                            name
                                            sku
                                            path
                                            seo {
                                                metaKeywords
                                            }
                                            categories {
                                                edges {
                                                    node {
                                                        name
                                                        path
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;

            const variables = { searchTerm, first: 50 };

            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ query, variables }),
            });

            const json = await response.json();

            // Extract products from response
            return json?.data?.site?.search?.searchProducts?.products?.edges?.map(edge => edge.node) || [];
        };
        const renderProducts = () => {
            const searchTerm = document.getElementById('custom-product-search');
            searchTerm.addEventListener('input', async () => {
                const products = await fetchAllProducts(searchTerm.value);
                const productList = document.getElementById('product-list');
                productList.innerHTML = '';
                products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.classList.add('product-item');
                    productItem.innerHTML = `
                        <h3>${product.name}</h3>
                        <p>SKU: ${product.sku}</p>
                        <a href="${product.path}">View Product</a>
                    `;
                    productList.appendChild(productItem);
                });
            });
        };
        renderProducts();
    }
}
