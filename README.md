# cloudflare-mysql
This is a modification to the [MySQL JavaScript package](https://github.com/mysqljs/mysql) which removes the node dependencies and refactors it for use in Cloudflare Workers.

Alongside the node dependency removals, two polyfills are provided, but only to the point that they're functional in this package. That is to say, they're not 100% polyfill covers, they're only a polyfill for the mysql package.

## Getting started
### Understanding the downsides
A major downside is that each request to your worker, will initialize one new connection. Connections **cannot be stored in the memory**. This will cause a much heavier impact on your MySQL server than if you'd only have server replicas running constantly.

#### If you're starting a new project,
then I advise you **strongly** to pick a serverless approach, such as [Cloudflare D1 (Open Alpha)](https://developers.cloudflare.com/d1/) or [Turso: SQLite Developer Experience in an Edge Database](https://turso.tech/).

### Using the package
Using the package is no different than using the original package, all you have to do is remove any dependencies to the previous package:
```
npm uninstall mysql @types/mysql
```

And add the this package:
```
npm install cloudflare-mysql
```

And change the imports from `mysql` to `cloudflare-mysql`.

Types are automatically included. The types are the same as @types/mysql, at the forked point. I will continue to provide patches to this package if the original package is at some point updated.

### Example
```ts
import { createConnection } from "cloudflare-mysql";

export default {
  async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const searchInput = url.searchParams.get("search");

    const result = await new Promise<any>((resolve) => {
      const connection = createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "database"
      });

      connection.connect((error) => {
        if(error)
          throw new Error(error.message);

        connection.query("SELECT title FROM articles WHERE title LIKE CONCAT('%', ?, '%')", [ searchInput ], (error, rows, fields) => {
          resolve({ fields, rows });
        });
      });

    });

    return new Response(JSON.stringify(result, undefined, 4));
  }
}

/*
  {
    "fields": [
      {
        "catalog": "def",
        "db": "developer_blog",
        "table": "articles",
        "orgTable": "articles",
        "name": "title",
        "orgName": "title",
        "charsetNr": 33,
        "length": 765,
        "type": 253,
        "flags": 4097,
        "decimals": 0,
        "zeroFill": false,
        "protocol41": true
      }
    ],
    "rows": [
      {
        "title": "Restricting a Google Maps API key"
      }
    ]
  }
 */
```

There is also a full [worker example](https://github.com/nora-soderlund/cloudflare-mysql/tree/main/example) that you can try locally or remotely.
