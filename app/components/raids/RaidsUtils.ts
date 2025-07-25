export const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toString();
};

export const getPriceChangeColor = (change: number): string => {
  if (change > 0) return "text-green-400";
  if (change < 0) return "text-red-400";
  return "text-gray-400";
};

export const copyImage = async (imageUrl: string): Promise<void> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
  } catch (error) {
    console.error("Failed to copy image:", error);
    throw error;
  }
};

export const updateLocalStorage = (key: string, value: string | boolean) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, String(value));
  }
};

export const getLocalStorage = (
  key: string,
  defaultValue: string | boolean
) => {
  if (typeof window !== "undefined") {
    const value = localStorage.getItem(key);
    if (value !== null) {
      return typeof defaultValue === "boolean" ? value === "true" : value;
    }
  }
  return defaultValue;
};
