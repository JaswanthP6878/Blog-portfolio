---
layout: "../../layouts/BlogLayout.astro"
title: Writing a MapReduce tool..
date: 12-10-2023
tags: ["Distributed Systems"]
---
### Introduction:
Map reduce has been a core part of Big data processing ever since it was conceived back in 2004 by Google. Google had a growing need for a sort of framework which helped in dealing with large data processing spanning Multiple servers. Another Requirement for them is to protect the programmer from the underlying complexity and provide him with a simple interface to perform these processing tasks. So, They created the map-reduce framework inspired by the functional programming concepts of mappers and reducers. In this framework, programmers have to write the map function and the reduce function and call the framework passing in the functions to it. Then the framework splits into a map-phase and a reduce phase and uses the map and reduce function respectively in each of those phases. There are several Implementations of map-reduce framework outside of google, one particularly famous one is the Hadoop's map-reduce framework.

I have found it fascinating how much complexity the map-reduce framework hides when i was using it on Hadoop. You just pass in two functions and a result computed even though the data and the compute resources are spread across on multiple servers. I could feel some big machinery working underneath the framework but did not know how it worked. So a weekend i spent reading the map-reduce white paper and kind of got a *feel* for the underlying concepts but had doubts on the implementation of map tasks work and how does Intermediate Data generation actually work and how to parallelise the processes for minimum runtimes.

So in order to better understand them I thought to build a miniature version of it. Though the version I set out to write works on local filesystem rather than a distributed file system and did not have the fault tolerant behaviour(of workers crashing), I think I got a good understanding on how map-reduce frameworks work in general and i want talk about my implementation of it. 

### Architecture:
Before looking into the technical details I want to talk about the broader *architecture* so to speak. A diagram for the architecture can be seen as shown below. 

![A starry night sky.](/images//Map-reduce-arch.excalidraw.png)

On expanding some of the points on the diagram:
1) (Ask for map task) : The workers ask for map tasks from the master, and the master which keeps the track of the Input File System would split up the directory and send the files to be worked on  to the workers. The splitting of files is based on the worker count (which is customisable) and number of files in the input file directory
2) (IR data from Map written to disk): After Workers process and run the *map* function on the data and produce IR(Intermediate Representation) data, they create IR files in such a way as to make the reduce workers task simple(more on this implementation details later)
3) (Ask for Reduce Task): After all the map workers have completed their tasks, the workers ask for reduce task and they would receive the location of the IR files.
4) (Read IR Buckets): The IR data which is in form of buckets are read by the reduce workers and the *reduce* function is applied on them.
5) Finally the data is written to out files whose location is again passed on to the Master(by workers). On these out files another cycle of map-reduce can be performed

Now that the basic architecture is explained, lets look at the implementation details

#### Implementation details
The tool is written in go. No particular reason apart from its the language i am most comfortable in and I do not need to use external libraries because of its powerful standard library.  All the communication between the workers and master take place through RPC calls. The choice for RPC based communication over go channels is because I wanted to simulate the situation as if the workers are running on separate machines(which is how they run in Hadoop and other map-reduce frameworks). 
#### Master and Worker structs:
The structures defined for master and worker to represent the kind of tasks that each process is in-charge of.

```go
// Master struct
type Master struct {
	workerFiles  map[int][]string // the files-split for each worker
	phase        Phase
	IRfiles      []string // The IR files locations 
	Worker_Count int
	WorkerStatus map[int]WorkerPhase
	OutFiles     []string // the output files location 
	sync.Mutex // embedded mutex
}

// Worker struct
type Worker struct {
	id           int
	done         chan int // for sending completed signal to main process
	worker_count int
}
```

The `sync.Mutex` that is embedded in Master is to make sure that reads and writes of the workers(which would be running in parallel) on the various data structures could happen without any problems such as *data races*.

The Master struct also has a `Phase` struct in it, this corresponds to the state or phase of the Master. This is used to send the either the map task or reduce task to the worker which is polling for tasks.

#### How the worker *works*:
The worker after recieving the...

>> Still writing....
