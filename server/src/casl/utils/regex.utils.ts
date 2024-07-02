export const getIdFromQuery = (requestQuery: string): string => {
  const regExp = /(?<=:\s+)[\w+ ]+/;
  return regExp.exec(requestQuery).toString();
};
