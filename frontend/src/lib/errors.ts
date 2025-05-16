// Helper (can be in a shared utility file e.g., @/lib/errors.ts)
import { BaseError as ViemBaseError } from 'viem';

// Type guard for ViemBaseError
export function isViemBaseError(error: unknown): error is ViemBaseError {
  return error instanceof ViemBaseError;
}

// Generic error logger/handler
export function handleServiceError(
    error: unknown,
    functionName: string,
    contextInfo?: Record<string, unknown>
): void {
    console.error(`Error in ${functionName}:`, {
        ...(contextInfo && { context: contextInfo }),
        rawError: error,
    });

    if (isViemBaseError(error)) {
        console.error(`  Viem Error: ${error.shortMessage}`);
        if (error.metaMessages && error.metaMessages.length > 0) {
            console.error(`  Details: ${error.metaMessages.join('\n           ')}`);
        }
        // Consider logging error.cause if it's relevant
    } else if (error instanceof Error) {
        console.error(`  Generic Error: ${error.message}`);
        if (error.stack) {
            // console.error(`  Stack: ${error.stack}`); // Can be verbose
        }
    } else {
        console.error("  An unknown error object was thrown.");
    }
}