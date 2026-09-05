import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { AzureStorage } = require("./azureStorage.cjs");

describe("AzureStorage.loadCharacterAssetFields", () => {
  it("preserves plain string-valued character attributes", async () => {
    const storage = new AzureStorage({ server: "dummy.database.windows.net" });
    const pool = {
      request() {
        return {
          input() {
            return this;
          },
          async query(query: string) {
            if (query.includes("[character].[characters]")) {
              return { recordset: [{ image: null }] };
            }
            if (query.includes("[character].[attributes]")) {
              return {
                recordset: [
                  {
                    key: "customBackground",
                    value: "asset://example/background.png",
                  },
                ],
              };
            }
            if (query.includes("[character].[emotions]")) {
              return { recordset: [] };
            }
            if (query.includes("[character].[assets]")) {
              return { recordset: [] };
            }
            throw new Error(`Unexpected query: ${query}`);
          },
        };
      },
    };

    storage.getPool = async () => pool;

    await expect(storage.loadCharacterAssetFields("char-1")).resolves.toEqual({
      assets: {
        customBackground: "asset://example/background.png",
      },
    });
  });
});
