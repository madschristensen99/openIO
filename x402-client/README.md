# x402 CLI tester

A simple tool to test x402-gated API endpoints.

Make sure you have funds on the chain of your choice, and that there is a `.env`
file present in the folder where you're running this which contains the KEY env
variable, which is a private key of a wallet that can be used.

Alternatively, provide the KEY as an environment variable.

Example usage:
```bash
bun i
```

```bash
bun src/cli.ts --method <METHOD> <URL>
```

e.g.

```bash
bun src/cli.ts --method POST https://openio.pullapp.xyz/benchmark
```
