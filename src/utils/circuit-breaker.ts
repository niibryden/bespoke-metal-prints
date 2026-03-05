/**
 * Circuit Breaker Pattern
 * Prevents hammering a failing backend by "opening the circuit"
 * when too many requests fail
 */

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening circuit
  successThreshold: number; // Number of successes to close circuit
  timeout: number; // Time in ms before attempting to retry (half-open state)
  name?: string; // Circuit name for logging
}

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing - rejecting requests
  HALF_OPEN = 'HALF_OPEN', // Testing if backend is back
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = 0;
  private options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      name: 'Circuit',
      ...options,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        const waitTime = Math.ceil((this.nextAttempt - Date.now()) / 1000);
        console.warn(
          `🔴 ${this.options.name} circuit OPEN - backend is down. ` +
            `Retry in ${waitTime}s. Use cached data or show offline mode.`
        );
        throw new Error(
          `Circuit breaker is OPEN. Backend appears to be down. Retry in ${waitTime}s.`
        );
      } else {
        // Attempt to half-open the circuit
        this.state = CircuitState.HALF_OPEN;
        console.log(`🟡 ${this.options.name} circuit HALF-OPEN - testing backend...`);
      }
    }

    try {
      const result = await fn();

      // Success
      this.onSuccess();
      return result;
    } catch (error) {
      // Failure
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.options.successThreshold) {
        this.close();
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.options.failureThreshold) {
      this.open();
    }
  }

  private open(): void {
    this.state = CircuitState.OPEN;
    this.nextAttempt = Date.now() + this.options.timeout;

    console.error(
      `🔴 ${this.options.name} circuit opened after ${this.failureCount} failures. ` +
        `Will retry in ${this.options.timeout / 1000}s`
    );
  }

  private close(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;

    console.log(`🟢 ${this.options.name} circuit closed - backend recovered`);
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = 0;
    console.log(`🔄 ${this.options.name} circuit manually reset`);
  }
}

// Global circuit breakers for different services
const circuitBreakers = new Map<string, CircuitBreaker>();

/**
 * Get or create a circuit breaker for a service
 */
export function getCircuitBreaker(
  service: string,
  options?: Partial<CircuitBreakerOptions>
): CircuitBreaker {
  if (!circuitBreakers.has(service)) {
    circuitBreakers.set(
      service,
      new CircuitBreaker({
        failureThreshold: 3, // Open after 3 failures
        successThreshold: 2, // Close after 2 successes
        timeout: 30000, // Wait 30s before retry
        name: service,
        ...options,
      })
    );
  }

  return circuitBreakers.get(service)!;
}

/**
 * Reset all circuit breakers
 */
export function resetAllCircuits(): void {
  circuitBreakers.forEach((cb) => cb.reset());
  console.log('🔄 All circuits reset');
}

/**
 * Get status of all circuit breakers
 */
export function getCircuitStatus(): Record<string, CircuitState> {
  const status: Record<string, CircuitState> = {};

  circuitBreakers.forEach((cb, name) => {
    status[name] = cb.getState();
  });

  return status;
}

/**
 * Check if any circuit is open
 */
export function hasOpenCircuits(): boolean {
  let hasOpen = false;

  circuitBreakers.forEach((cb) => {
    if (cb.getState() === CircuitState.OPEN) {
      hasOpen = true;
    }
  });

  return hasOpen;
}
