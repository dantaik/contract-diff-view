# CodeDiff

A web application for comparing verified smart contract implementations across EVM chains. CodeDiff helps developers understand code-level changes during contract upgrades by fetching source code from Etherscan and displaying side-by-side diffs.

**🌐 Live:** [codediff.taiko.eth](https://codediff.taiko.eth)

## Features

- 🔍 **Multi-Chain Support** - Compare contracts on Ethereum, Taiko, and other EVM chains
- 📊 **Side-by-Side Diffs** - Visual diff viewer with syntax highlighting
- 📁 **Multi-File Contracts** - Support for complex contracts with multiple source files
- 💾 **Smart Caching** - Local caching with chain-specific keys to reduce API calls
- 🔑 **Custom API Keys** - Bring your own Etherscan API key or use default keys
- 📱 **Responsive Design** - Mobile-friendly interface with glass morphism effects
- 🔗 **Deep Linking** - Share comparisons via URL parameters
- 🎯 **Filter Changed Files** - Focus on modified files only
- 📈 **Cache Statistics** - Track remote fetches vs cached loads
- ⚠️ **Detailed Error Reporting** - Expandable technical details for debugging

## Quick Start

### Using the App

1. Visit [codediff.taiko.eth](https://codediff.taiko.eth)
2. Select chain (Ethereum, Taiko, etc.)
3. Enter proxy contract address
4. Enter new implementation address
5. (Optional) Add your Etherscan API key
6. Click "Compare Contracts"

### URL Parameters

Share comparisons via URL with these parameters:

```
https://codediff.taiko.eth/?addr=0x...&newimpl=0x...&chainid=1
```

| Parameter | Description | Example |
|-----------|-------------|---------|
| `addr` | Proxy contract address | `0xd60247c6848...` |
| `newimpl` | New implementation address | `0x2705b12a971...` |
| `chainid` | Chain ID (1=Ethereum, 167000=Taiko) | `1` |

### Example URLs

**Ethereum Mainnet:**
```
https://codediff.taiko.eth/?addr=0xd60247c6848B7Ca29eDdF63AA924E53dB6Ddd8EC&newimpl=0x2705b12a971da766a3f9321a743d61cead67da2f&chainid=1
```

**Taiko:**
```
https://codediff.taiko.eth/?addr=0x...&newimpl=0x...&chainid=167000
```

## Development

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- Etherscan API key (optional for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/dantaik/contract-diff-view.git
cd contract-diff-view

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# Primary API key
VITE_ETHERSCAN_API_KEY=your_api_key_here

# Optional: Fallback keys (comma-separated)
VITE_ETHERSCAN_FALLBACK_KEYS=key2,key3,key4
```

**Get your API key:** [etherscan.io/myapikey](https://etherscan.io/myapikey)

**Note:** Users can also provide their own API key through the web interface, which will be saved to localStorage and used instead of environment keys.

### Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework with latest features |
| **TypeScript** | Type safety and better DX |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **diff2html** | Diff generation and visualization |
| **Etherscan API V2** | Verified contract source code |

## Architecture

### How It Works

1. **Input:** User enters proxy address, new implementation address, and chain ID
2. **Proxy Resolution:** App queries proxy contract to get current implementation address
3. **Source Fetching:** Parallel fetch of old and new implementation source code from Etherscan
4. **Caching:** Results cached in localStorage with chain-specific keys (24h TTL)
5. **Diff Generation:** File-by-file comparison using `diff` algorithm
6. **Visualization:** Side-by-side HTML diff with syntax highlighting

### Caching Strategy

- **Cache Key Format:** `chain{chainId}:{address}` or `chain{chainId}:{address}:{fileName}`
- **Expiration:** 24 hours
- **Statistics Tracking:** Counts cached vs remote fetches per comparison
- **Chain Isolation:** Different chains maintain separate caches

### API Key Management

- **Priority:** Custom API key > Environment primary key > Fallback keys
- **Custom Keys:** Saved to localStorage and persist across sessions
- **Rate Limiting:** 250ms delay between requests, exponential backoff on rate limits
- **Error Handling:** Non-retryable errors (invalid address, unverified contracts) fail immediately

### Error Handling

- **User-Friendly Messages:** Clear error descriptions with affected addresses
- **Technical Details:** Expandable section with stack traces and context
- **Non-Retryable Errors:** Invalid addresses, unverified contracts, deprecated APIs
- **Timeout Protection:** Prevents infinite loading on permanent failures

## Project Structure

```
src/
├── components/
│   ├── DiffViewer.tsx      # Side-by-side diff display
│   ├── FileList.tsx        # File navigation sidebar
│   └── InputForm.tsx       # Input form with chain selector
├── lib/
│   ├── constants.ts        # Shared constants and configuration
│   ├── diff.ts             # Diff generation logic
│   └── etherscan.ts        # API client with caching
├── App.tsx                 # Main application component
├── main.tsx                # Application entry point
└── index.css               # Global styles and Tailwind
```

## Supported Chains

| Chain | Chain ID |
|-------|----------|
| Ethereum Mainnet | 1 |
| Taiko | 167000 |

*More chains can be added by updating `SUPPORTED_CHAINS` in `src/lib/constants.ts`*

## API Rate Limits

- **Free Tier:** 5 calls/second, 100,000 calls/day
- **Caching:** Reduces API usage significantly
- **Multiple Keys:** Rotate through fallback keys automatically
- **Custom Keys:** Users can provide their own keys for higher limits

## Contributing

Contributions welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Vercel (Recommended)

1. Import project from GitHub
2. Configure build settings:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variables for API keys
4. Deploy

### Manual Deployment

```bash
# Build
npm run build

# Deploy dist/ folder to your hosting provider
```

## License

MIT License - see LICENSE file for details

## Links

- **Live App:** [codediff.taiko.eth](https://codediff.taiko.eth)
- **GitHub:** [github.com/dantaik/contract-diff-view](https://github.com/dantaik/contract-diff-view)
- **Etherscan API:** [docs.etherscan.io](https://docs.etherscan.io/)

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/dantaik/contract-diff-view/issues) page.

---

Built with ❤️ for the Ethereum community
