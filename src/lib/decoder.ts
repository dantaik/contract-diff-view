import { AbiCoder } from 'ethers';

export interface DecodedParam {
  name: string;
  type: string;
  value: string;
}

/**
 * Decode constructor arguments using the contract ABI
 */
export function decodeConstructorArguments(
  abi: any[],
  encodedArgs: string | null
): DecodedParam[] | null {
  if (!encodedArgs || encodedArgs === '0x' || encodedArgs === '') {
    return null;
  }

  try {
    // Find the constructor in the ABI
    const constructor = abi.find((item) => item.type === 'constructor');

    if (!constructor || !constructor.inputs || constructor.inputs.length === 0) {
      return null;
    }

    // Add 0x prefix if not present
    const hexArgs = encodedArgs.startsWith('0x') ? encodedArgs : `0x${encodedArgs}`;

    // Create ABI coder
    const abiCoder = AbiCoder.defaultAbiCoder();

    // Decode the constructor arguments
    const types = constructor.inputs.map((input: any) => input.type);
    const decoded = abiCoder.decode(types, hexArgs);

    // Map decoded values to parameters with names and types
    const result: DecodedParam[] = constructor.inputs.map((input: any, index: number) => {
      const value = decoded[index];

      return {
        name: input.name || `param${index}`,
        type: input.type,
        value: formatValue(value, input.type)
      };
    });

    return result;
  } catch (error) {
    console.error('Error decoding constructor arguments:', error);
    return null;
  }
}

/**
 * Format decoded value for display
 */
function formatValue(value: any, type: string): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return `[${value.map(v => formatValue(v, type.replace('[]', ''))).join(', ')}]`;
  }

  // Handle BigInt
  if (typeof value === 'bigint') {
    return value.toString();
  }

  // Handle addresses
  if (type === 'address') {
    return value.toString();
  }

  // Handle bytes
  if (type.startsWith('bytes')) {
    return value.toString();
  }

  // Handle strings
  if (type === 'string') {
    return `"${value}"`;
  }

  // Handle booleans
  if (type === 'bool') {
    return value ? 'true' : 'false';
  }

  // Default: convert to string
  return value.toString();
}
