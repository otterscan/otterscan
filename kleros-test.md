# Kleros Scout Integration Test

## Test Addresses (from the demo)

Based on the provided cURL demo, we can test these addresses:

1. **Seaport 1.5 Contract**: `0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC`
   - Project: OpenSea
   - Name: Seaport 1.5
   - Should show on Ethereum mainnet (chain ID 1)

2. **UNI Token Contract**: `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984`
   - Project: Uniswap Protocol
   - Name: UNI Token
   - Has token attributes (logo, symbol, decimals)
   - Should show on Ethereum mainnet (chain ID 1)

3. **Test address with no tags**: `0xed2d13a70acbd61074fc56bd0d0845e35f793e5e`
   - Should return empty array (no tags)

## Features Implemented

✅ **Service Layer**: `src/kleros/useKleros.ts`
- Hook for fetching single address tags
- Hook for batch fetching multiple addresses
- React Query integration with proper caching
- Error handling and fallbacks

✅ **Configuration**: `src/useConfig.ts`
- Added Kleros config section to OtterscanConfig type
- Support for enabled/disabled, custom API URL, supported chains

✅ **UI Components**:
- `KlerosLogo.tsx`: Small logo for badges
- `KlerosTagBadge.tsx`: Compact display for address links
- `KlerosAddressInfo.tsx`: Detailed information panel

✅ **Integration Points**:
- `DecoratedAddressLink`: Shows compact Kleros badge next to addresses
- `AddressSubtitle`: Shows project name in address header
- `AddressTransactionResults`: Shows detailed Kleros info on overview page

✅ **Configuration**: `public/config.json`
- Added example Kleros configuration
- Enabled for chains 1, 137, 42161 (Ethereum, Polygon, Arbitrum)

## Testing

The development server is running at http://localhost:5174/

To test:
1. Navigate to one of the test addresses above
2. Look for the Kleros logo and project name
3. Check the overview page for detailed Kleros information

Note: Requires internet connection to fetch from Kleros Scout API.