// source: https://github.com/appwrite/sdk-for-node/blob/master/lib/query.js
export class Query {
  static equal = (attribute: string, value: string) =>
    Query.addQuery(attribute, "equal", value);

  static notEqual = (attribute: string, value: string) =>
    Query.addQuery(attribute, "notEqual", value);

  static lesser = (attribute: string, value: string) =>
    Query.addQuery(attribute, "lesser", value);

  static lesserEqual = (attribute: string, value: string) =>
    Query.addQuery(attribute, "lesserEqual", value);

  static greater = (attribute: string, value: string) =>
    Query.addQuery(attribute, "greater", value);

  static greaterEqual = (attribute: string, value: string) =>
    Query.addQuery(attribute, "greaterEqual", value);

  static search = (attribute: string, value: string) =>
    Query.addQuery(attribute, "search", value);

  static addQuery = (attribute: string, oper: string, value: string) =>
    `${attribute}.${oper}(${Query.parseValues(value)})`;

  static parseValues = (value: string) =>
    `"${value}"`;
}
