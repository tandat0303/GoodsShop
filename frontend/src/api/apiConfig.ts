type apiConfigAttribute = {
  baseUrl: string;
};

const apiConfig: apiConfigAttribute = {
  baseUrl: import.meta.env.VITE_URLS,
};

export { apiConfig };
