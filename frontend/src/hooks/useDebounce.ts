import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value.
 * The debounced value only updates after the specified delay
 * has passed since the last change to the input value.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 400ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay = 400): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
