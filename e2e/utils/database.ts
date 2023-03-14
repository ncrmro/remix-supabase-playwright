import pwConfig from "../../playwright.config";
import { test } from "@playwright/test";
import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

const {
  DATABASE_HOST: host,
  DATABASE_PORT: port,
  DATABASE_USER: user,
  DATABASE_PASSWORD: password,
} = process.env;

export const databasePool = () =>
  new Pool({
    host: host || "localhost",
    port: Number(port) || 54322,
    user: user || "postgres",
    password: password || "postgres",
  });

export interface DatabaseClient extends PoolClient {
  /**
   * This functions is used to repeat a query until conditionToBeTrue returns true
   * By default after ten trys (over one second) we will start logging the attempts
   * @param query
   * @param args
   * @param conditionToBeTrue
   * @param timeout
   */
  waitForQuery<R extends QueryResultRow = any>(
    query: string,
    args: Array<string | number>,
    conditionToBeTrue: (res: QueryResult<R>) => boolean,
    timeout?: number
  ): Promise<QueryResult<R>>;
}

export async function databaseClientTestFixture(pool: Pool) {
  const db = (await pool.connect()) as DatabaseClient;
  db.waitForQuery = async (query, args, conditionToBeTrue, timeout = 300) => {
    let attempt = 0;
    let res = await db.query(query, args);
    // The max attempt will fail in about half the time the actual test will fail
    const maxAttempt = (pwConfig.timeout! * 0.5) / timeout;
    while (!conditionToBeTrue(res)) {
      attempt++;
      if (attempt >= maxAttempt) {
        console.log(`Rows not matching condition where:`, res.rows);
        test.expect(conditionToBeTrue(res)).toBeTruthy();
      }
      await new Promise((resolve) => {
        setTimeout(resolve, timeout);
      });
      res = await db.query(query, args);
    }
    return res;
  };
  return db;
}
