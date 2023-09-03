import { createConnection } from "cloudflare-mysql";

export interface Env {
  MYSQL_HOST: string;
  MYSQL_USER_NAME: string;
  MYSQL_USER_PASSWORD?: string;
  MYSQL_DATABASE?: string;
};

export default {
	async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
		const result = await new Promise<any>((resolve) => {
      const connection = createConnection({
        host: env.MYSQL_HOST,
        user: env.MYSQL_USER_NAME,
        password: env.MYSQL_USER_PASSWORD,
        database: env.MYSQL_DATABASE
      });

      connection.on("error", (error) => console.error(error));
  
      connection.connect((error) => {
        if(error)
          throw new Error(error.message);

        connection.query("SELECT id, title FROM articles WHERE title LIKE ?", [ "%Google%" ], (error, rows, fields) => {
          if(error)
            throw new Error(error.message);

          const articles = { fields, rows };

          connection.query(`SELECT * FROM article_tags WHERE article IN (${rows.map((row: any) => connection.escape(row.id)).join(', ')})`, (error, rows, fields) => {
            if(error)
              throw new Error(error.message);
  
            connection.end();
  
            resolve({ articles, articleTags: { fields, rows } });
          });
        });
      });
    });

    return new Response(JSON.stringify(result, undefined, 4));
	}
};
