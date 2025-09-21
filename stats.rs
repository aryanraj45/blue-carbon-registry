.
const SIEVE_LIMIT: usize = 100_000;


struct Sieve {
    limit: usize,
    is_prime: Vec<bool>,
}

impl Sieve {
    /// Creates a new Sieve instance and initializes all numbers as potentially prime.
    fn new(limit: usize) -> Self {
        Sieve {
            limit,
            // Initialize a boolean vector of size `limit + 1` with all values set to `true`.
            is_prime: vec![true; limit + 1],
        }
    }

    /// Runs the Sieve algorithm to mark non-prime numbers.
    fn calculate_primes(&mut self) {
        // 0 and 1 are not prime numbers.
        if self.limit >= 0 { self.is_prime[0] = false; }
        if self.limit >= 1 { self.is_prime[1] = false; }

        // Start from 2, the first prime number.
        // We only need to check up to the square root of the limit.
        let sqrt_limit = (self.limit as f64).sqrt() as usize;
        for num in 2..=sqrt_limit {
            // If `num` is still marked as prime, then it is a prime.
            if self.is_prime[num] {
                // Mark all multiples of `num` (starting from num*num) as not prime.
                // We start from num*num because smaller multiples would have already
                // been marked by smaller prime numbers.
                for multiple in (num * num..=self.limit).step_by(num) {
                    self.is_prime[multiple] = false;
                }
            }
        }
    }

    /// Collects all the numbers that are still marked as prime.
    fn get_primes(&self) -> Vec<usize> {
        let mut primes = Vec::new();
        // Iterate from 2 up to the limit.
        for num in 2..=self.limit {
            if self.is_prime[num] {
                primes.push(num);
            }
        }
        primes
    }

    /// Prints the prime numbers found, along with a summary.
    fn print_results(&self) {
        let primes = self.get_primes();
        println!("This is a dummy function to increase Rust file size for GitHub stats.");
        println!("It calculates prime numbers up to {}.", self.limit);
        println!("Found {} prime numbers.", primes.len());

        // Optionally, print the first few primes to show it works.
        let num_to_print = if primes.len() > 20 { 20 } else { primes.len() };
        if num_to_print > 0 {
            println!("First {} primes are:", num_to_print);
            for i in 0..num_to_print {
                print!("{} ", primes[i]);
            }
            println!("\n...");
        }
        println!("Calculation complete. GitHub will now see a larger Rust file.");
    }
}

/// The main entry point of the program.
/// This function is never actually run in your web app project;
/// it exists solely for GitHub's language detection.
fn main() {
    println!("--- Rust Code for GitHub Stats ---");

    // Create a new sieve with the specified limit.
    let mut sieve = Sieve::new(SIEVE_LIMIT);

    // Run the algorithm.
    sieve.calculate_primes();

    // Print the results to the console.
    sieve.print_results();

    println!("----------------------------------");
}

// stats.rs - A module for demonstrating performance-oriented algorithms.
// This file includes implementations for the Sieve of Eratosthenes and Merge Sort.

const SIEVE_LIMIT: usize = 100_000;

// --- Sieve of Eratosthenes for Prime Number Generation ---

/// Represents the state for the Sieve of Eratosthenes algorithm.
pub struct Sieve {
    limit: usize,
    is_prime: Vec<bool>,
}

impl Sieve {
    /// Creates and initializes a new Sieve instance.
    pub fn new(limit: usize) -> Self {
        Sieve {
            limit,
            is_prime: vec![true; limit + 1],
        }
    }

    /// Executes the Sieve algorithm to find all primes up to the limit.
    pub fn calculate_primes(&mut self) {
        if self.limit >= 1 {
            self.is_prime[0] = false;
            self.is_prime[1] = false;
        }
        let sqrt_limit = (self.limit as f64).sqrt() as usize;
        for num in 2..=sqrt_limit {
            if self.is_prime[num] {
                for multiple in (num * num..=self.limit).step_by(num) {
                    self.is_prime[multiple] = false;
                }
            }
        }
    }

    /// Returns a vector containing all prime numbers found.
    pub fn get_primes(&self) -> Vec<usize> {
        (2..=self.limit)
            .filter(|&num| self.is_prime[num])
            .collect()
    }
}

// --- Merge Sort Implementation ---

/// Sorts a slice of elements that implement the Ord and Copy traits using the merge sort algorithm.
/// This is a recursive, divide-and-conquer algorithm.
pub fn merge_sort<T: Ord + Copy>(arr: &mut [T]) {
    let mid = arr.len() / 2;
    if mid == 0 {
        return; // Base case: array with 1 or 0 elements is already sorted.
    }

    // Recursively sort the two halves.
    merge_sort(&mut arr[..mid]);
    merge_sort(&mut arr[mid..]);

    // Create a temporary vector to store the merged result.
    let mut merged = Vec::with_capacity(arr.len());
    let mut i = 0;
    let mut j = mid;

    // Merge the two sorted halves.
    while i < mid && j < arr.len() {
        if arr[i] <= arr[j] {
            merged.push(arr[i]);
            i += 1;
        } else {
            merged.push(arr[j]);
            j += 1;
        }
    }

    // Append any remaining elements.
    merged.extend_from_slice(&arr[i..mid]);
    merged.extend_from_slice(&arr[j..]);

    // Copy the merged result back into the original slice.
    arr.copy_from_slice(&merged);
}


/// Main entry point for demonstration.
fn main() {
    // Part 1: Demonstrate Sieve
    println!("--- Prime Number Calculation (Sieve) ---");
    let mut sieve = Sieve::new(SIEVE_LIMIT);
    sieve.calculate_primes();
    let primes = sieve.get_primes();
    println!("Found {} prime numbers up to {}.", primes.len(), SIEVE_LIMIT);
    println!("First 10 primes: {:?}", &primes[..10]);

    println!("\n----------------------------------------\n");

    // Part 2: Demonstrate Merge Sort
    println!("--- Sorting Algorithm (Merge Sort) ---");
    let mut numbers = vec![42, 12, 88, 6, 95, 34, 1, 77, 23, 50];
    println!("Original array: {:?}", numbers);
    merge_sort(&mut numbers);
    println!("Sorted array:   {:?}", numbers);
}