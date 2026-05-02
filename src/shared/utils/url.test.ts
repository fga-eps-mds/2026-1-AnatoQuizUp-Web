
import { trimTrailingSlash } from "./url"

describe("Testa função para retirar '/'s ao final da url", ()=> {
    const test_url: string = "http://localhost:3333/api/v1";

    it("Url não terminada em '/' não deve ser alterada", () => {
        const result = trimTrailingSlash(test_url);
        expect(result).toBe("http://localhost:3333/api/v1");
    });

    it("Url terminada em '/' deve ser alterada ", () => {
        const slash_terminated_url = test_url.concat("//");
        const result = trimTrailingSlash(slash_terminated_url);
        expect(result).toBe("http://localhost:3333/api/v1");
    });
});