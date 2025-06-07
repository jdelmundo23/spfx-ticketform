export const formatDate = (date: Date): string => {
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const year = String(date.getFullYear()).slice(-2);

  return `${month}/${day}/${year}`;
};

export const replaceQuotes = (string: string) : string => {
    return string.replace(/"/g, "'");
}
