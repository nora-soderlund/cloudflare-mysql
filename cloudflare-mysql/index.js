import Connection from "./lib/Connection";
import ConnectionConfig from "./lib/ConnectionConfig"; 
import PoolConfig from "./lib/PoolConfig";
import Pool from "./lib/Pool";
import PoolCluster from "./lib/PoolCluster";
import SqlString from "./lib/protocol/SqlString";

/**
 * Create a new Connection instance.
 * @param {object|string} config Configuration or connection string for new MySQL connection
 * @return {Connection} A new MySQL connection
 * @public
 */
export function createConnection(config) {
  return new Connection({config: new ConnectionConfig(config)});
};

/**
 * Create a new Pool instance.
 * @param {object|string} config Configuration or connection string for new MySQL connections
 * @return {Pool} A new MySQL pool
 * @public
 */
export function createPool(config) {
  return new Pool({config: new PoolConfig(config)});
};

/**
 * Create a new PoolCluster instance.
 * @param {object} [config] Configuration for pool cluster
 * @return {PoolCluster} New MySQL pool cluster
 * @public
 */
export function createPoolCluster(config) {
  return new PoolCluster(config);
};

/**
 * Create a new Query instance.
 * @param {string} sql The SQL for the query
 * @param {array} [values] Any values to insert into placeholders in sql
 * @param {function} [callback] The callback to use when query is complete
 * @return {Query} New query object
 * @public
 */
export function createQuery(sql, values, callback) {
  return Connection.createQuery(sql, values, callback);
};

/**
 * Escape a value for SQL.
 * @param {*} value The value to escape
 * @param {boolean} [stringifyObjects=false] Setting if objects should be stringified
 * @param {string} [timeZone=local] Setting for time zone to use for Date conversion
 * @return {string} Escaped string value
 * @public
 */
export function escape(value, stringifyObjects, timeZone) {
  return SqlString.escape(value, stringifyObjects, timeZone);
};

/**
 * Escape an identifier for SQL.
 * @param {*} value The value to escape
 * @param {boolean} [forbidQualified=false] Setting to treat '.' as part of identifier
 * @return {string} Escaped string value
 * @public
 */
export function escapeId(value, forbidQualified) {
  return SqlString.escapeId(value, forbidQualified);
};

/**
 * Format SQL and replacement values into a SQL string.
 * @param {string} sql The SQL for the query
 * @param {array} [values] Any values to insert into placeholders in sql
 * @param {boolean} [stringifyObjects=false] Setting if objects should be stringified
 * @param {string} [timeZone=local] Setting for time zone to use for Date conversion
 * @return {string} Formatted SQL string
 * @public
 */
export function format(sql, values, stringifyObjects, timeZone) {
  return SqlString.format(sql, values, stringifyObjects, timeZone);
};

/**
 * Wrap raw SQL strings from escape overriding.
 * @param {string} sql The raw SQL
 * @return {object} Wrapped object
 * @public
 */
export function raw(sql) {
  return SqlString.raw(sql);
};
