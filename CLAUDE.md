# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Otterscan is an open-source, local Ethereum block explorer built as a React application. It's designed to work with Erigon nodes and provides a fast, privacy-focused alternative to centralized block explorers. The application enables users to explore blocks, transactions, addresses, contracts, and consensus data directly from their local Erigon node.

## Development Commands

### Core Development

- `npm start` - Start development server with Vite (default port 5173)
- `npm run build` - Build production version (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build
- `npm test` - Run Jest unit tests

### Specialized Development

- `npm run start-devnet` - Start with devnet configuration using `cypress/support/devnet-config.json`
- `npm run storybook` - Start Storybook development server on port 6006
- `npm run build-storybook` - Build static Storybook

### Testing

- `npm run cy:run-mainnet` - Run Cypress E2E tests for mainnet
- `npm run cy:run-devnet` - Run Cypress E2E tests for devnet
- `npm run source-map-explorer` - Analyze bundle size

### Parser Generation

- `npm run build-parsers` - Generate contract input data parser from grammar file

## Architecture Overview

### Core Structure

The application follows a React Router-based architecture with lazy-loaded components:

- **App.tsx**: Main application entry with router configuration, context providers, and loading states
- **Main.tsx**: Primary layout component that wraps most pages
- **Home.tsx**: Landing page component
- **types.ts**: Core type definitions including transaction data, chain info, and connection status

### Key Directories

#### `/src/execution/`

Contains all execution layer (Ethereum L1) related components:

- **Block.tsx**, **Transaction.tsx**, **Address.tsx**: Main entity pages
- **address/**: Address-specific functionality including contract interaction, token holdings, transactions
- **block/**: Block-specific components and transaction listings
- **transaction/**: Transaction details, logs, traces, and decoding components
- **components/**: Shared execution layer components

#### `/src/consensus/`

Consensus layer (Beacon Chain) related components:

- **Epoch.tsx**, **Slot.tsx**, **Validator.tsx**: Main consensus entities
- **epoch/**, **slot/**, **validator/**: Entity-specific components
- **components/**: Shared consensus components

#### `/src/api/`

External service integrations:

- **address-resolver/**: Multi-source address name resolution (ENS, tokens, Uniswap, hardcoded)
- **token-price-resolver/**: Token price fetching from Uniswap pools

#### `/src/components/`

Reusable UI components with extensive Storybook stories

#### `/src/sourcify/`

Sourcify contract verification integration

#### `/src/search/`

Search functionality including QR code scanning

#### `/src/token/`

Token-related pages and components (ERC20, ERC721, etc.)

#### `/src/special/`

Special features like London hard fork live blocks visualization

#### `/src/ots2/`

Integration with Otterscan API v2 (OTS2) for enhanced functionality

### Configuration System

The application uses a flexible configuration system:

- **public/config.json**: Main configuration file loaded at runtime
- **useConfig.ts**: Configuration loading and environment variable overrides
- **VITE_CONFIG_JSON**: Environment variable for complete config override
- **VITE\_\*** variables\*\*: Individual config overrides during development

Key configuration options:

- `erigonURL`: Erigon node JSON-RPC endpoint
- `beaconAPI`: Beacon chain API endpoint (optional)
- `assetsURLPrefix`: Static assets URL
- `experimental`: Enable experimental features
- `chainInfo`: Chain metadata (name, native currency, faucets)
- `priceOracleInfo`: Price oracle configuration
- `sourcify`: Custom Sourcify sources

### State Management

- **React Query (@tanstack/react-query)**: Server state management and caching
- **React Context**: Global application state (runtime, chain info, app config)
- **SWR**: Additional data fetching for certain components
- **Local hooks**: Component-specific state management

### Runtime System

The application builds a runtime context that includes:

- Provider connection to Erigon node
- Chain information detection/configuration
- API level verification
- Connection status management

### Key Hooks and Utilities

- **useErigonHooks.ts**: Core Erigon node interaction
- **useRuntime.ts**: Runtime context creation and management
- **useChainInfo.ts**: Chain information handling
- **useSourcify.ts**: Sourcify contract verification
- **useProvider.ts**: Ethereum provider management

### Component Architecture

Components follow React best practices:

- Extensive use of lazy loading for performance
- Comprehensive Storybook stories for UI components
- TypeScript throughout with strict typing
- Error boundaries for robust error handling
- Suspense boundaries for loading states

### Data Flow

1. Configuration loaded from `config.json` or environment
2. Runtime built with provider connection and chain detection
3. React Query manages server state with prefetching in route loaders
4. Components consume data through hooks and context
5. UI updates reactively based on query state changes

## Testing Strategy

- **Unit Tests**: Jest for utility functions and components
- **E2E Tests**: Cypress for full application testing
- **Storybook**: Component isolation and visual testing
- **Multiple Environments**: Mainnet and devnet testing configurations

## Development Notes

- Uses Vite as build tool with React SWC plugin
- TailwindCSS for styling with custom configuration
- Ethers.js for Ethereum interactions
- Extensive use of FontAwesome icons
- Docker support for containerized deployment
- GitHub Actions for CI/CD
