# Smart Contract Upgrade Diff Viewer

A web application that compares source code differences between two verified smart contract implementations on Ethereum. This tool helps developers understand code-level changes during contract upgrades.

## Features

- 🔍 Fetch verified source code from Etherscan API
- 📊 Side-by-side diff visualization with syntax highlighting
- 📁 Multi-file contract support
- 💾 Local caching to reduce API calls
- 🔗 Deep linking via URL parameters
- 📱 Responsive, mobile-friendly design

## Demo Usage

### URL Parameters

The app supports deep-linking via query parameters:

```
https://your-app.com/?addr=0xd60247c6848B7Ca29eDdF63AA924E53dB6Ddd8EC&newimpl=0x2705b12a971da766a3f9321a743d61cead67da2f
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `addr` | Address of the upgradable (proxy) contract | - |
| `newimpl` | Address of the new implementation | - |
| `chainid` | Chain ID for the network (1=Ethereum, 56=BSC, 137=Polygon, etc.) | `1` |

### Example

Compare implementations for the example proxy contract:

```
http://localhost:5173/?addr=0xd60247c6848B7Ca29eDdF63AA924E53dB6Ddd8EC&newimpl=0x2705b12a971da766a3f9321a743d61cead67da2f
```

## Development

### Prerequisites

- Node.js 20.19+ or 22.12+ (recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your Etherscan API key:

```
VITE_ETHERSCAN_API_KEY=your_api_key_here
```

Get your API key from [Etherscan](https://etherscan.io/myapikey).

Optional: Add fallback API keys (comma-separated):
```
VITE_ETHERSCAN_FALLBACK_KEYS=key2,key3
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Diff Library:** diff2html
- **API:** Etherscan API

## How It Works

1. User enters a proxy contract address and new implementation address
2. App fetches current implementation address from the proxy contract
3. Fetches verified source code for both old and new implementations from Etherscan
4. Parses multi-file contracts and matches files by name
5. Generates side-by-side diffs with syntax highlighting
6. Results are cached locally to reduce API calls

## API Keys

API keys are configured via environment variables. See the [Environment Setup](#environment-setup) section above for details.

## Caching

Contract source files are cached in `localStorage` with:
- Cache key format: `{implementationAddress}:{fileName}`
- Expiration: 24 hours
- Automatic cleanup on expiration

## License

MIT
