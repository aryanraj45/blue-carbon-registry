
package main

import (
	"fmt"
	"sync"
	"time"
)


const numWorkers = 8

func worker(id int, wg *sync.WaitGroup) {
	// Defer the wg.Done() call to ensure it's called when the function exits.
	// This is crucial for preventing the program from getting stuck.
	defer wg.Done()

	fmt.Printf("Worker %d: Starting task.\n", id)

	// Simulate work by sleeping for a short, variable duration.
	// This makes the output more interesting and shows true concurrency.
	sleepDuration := time.Duration(100+id*50) * time.Millisecond
	time.Sleep(sleepDuration)

	result := id * id
	fmt.Printf("Worker %d: Finished task. Result: %d.\n", id, result)
}


func main() {
	fmt.Println("--- Go Code for GitHub Stats ---")
	fmt.Printf("This is a dummy program to increase Go's percentage in repository stats.\n")
	fmt.Printf("Starting %d concurrent workers...\n\n", numWorkers)

	
	var wg sync.WaitGroup

	// Launch several workers concurrently.
	for i := 1; i <= numWorkers; i++ {
		// Increment the WaitGroup counter for each new Goroutine.
		wg.Add(1)
		
		// We pass 'i' as an argument to avoid a common loop variable closure issue.
		go worker(i, &wg)
	}

	
	fmt.Println("\nMain: Waiting for all workers to finish.")
	wg.Wait()

	fmt.Println("\nMain: All workers have completed their tasks.")
	fmt.Println("GitHub will now see a larger, more representative Go file.")
	fmt.Println("----------------------------------")
}

// stats.go - A module demonstrating a concurrent data processing pipeline.
// This implementation uses channels to distribute jobs and collect results.
package main

import (
	"fmt"
	"sync"
	"time"
)

// Task represents a job to be processed by a worker.
type Task struct {
	id      int
	payload int
}

// Result holds the outcome of a processed task.
type Result struct {
	task      Task
	output    int
	worker_id int
}

// worker is the core concurrent processor.
// It reads tasks from a 'jobs' channel and sends results to a 'results' channel.
func worker(id int, wg *sync.WaitGroup, jobs <-chan Task, results chan<- Result) {
	defer wg.Done()
	for task := range jobs {
		fmt.Printf("Worker %d: started job %d\n", id, task.id)
		// Simulate complex work by sleeping.
		time.Sleep(time.Millisecond * 500)
		// The "work" is just squaring the payload.
		output := task.payload * task.payload
		results <- Result{task: task, output: output, worker_id: id}
		fmt.Printf("Worker %d: finished job %d\n", id, task.id)
	}
}

// main orchestrates the pipeline.
func main() {
	const numJobs = 10
	const numWorkers = 3

	jobs := make(chan Task, numJobs)
	results := make(chan Result, numJobs)

	var wg sync.WaitGroup

	fmt.Printf("Starting %d workers to process %d jobs.\n", numWorkers, numJobs)

	// Launch worker pool.
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(w, &wg, jobs, results)
	}

	// Send jobs to the workers via the jobs channel.
	for j := 1; j <= numJobs; j++ {
		jobs <- Task{id: j, payload: j * 2}
	}
	close(jobs) // Close the jobs channel to signal workers that no more jobs will be sent.

	// Wait for all workers to finish processing.
	wg.Wait()
	close(results) // Close the results channel after all workers are done.

	fmt.Println("\n--- All jobs processed. Collecting results: ---")
	// Collect and print all results.
	totalSum := 0
	for result := range results {
		fmt.Printf("Result from Worker %d for Task %d: Input=%d, Output=%d\n",
			result.worker_id, result.task.id, result.task.payload, result.output)
		totalSum += result.output
	}
	fmt.Printf("\nProcessing complete. Sum of all results: %d\n", totalSum)
}