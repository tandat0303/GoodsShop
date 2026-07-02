export const getApiErrorMessage = async (error: any): Promise<string> => {
  if (error?.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      const json = JSON.parse(text);

      return json.message || "Unexpected error occurred";
    } catch {
      return error.message;
    }
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "Unexpected error occurred";
};

export const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );
