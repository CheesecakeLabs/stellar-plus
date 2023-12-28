---
description: Profiling Smart Contract Interactions with the Soroban Profiler
---

# Soroban Profiler

The Soroban Profiler is a utility tool included in the Utils section of the Stellar Plus library, aimed at profiling smart contract interactions on the Stellar network. It serves as a pre-built option for tracking and analyzing contract performance metrics. The flexibility in the ContractEngine class of Stellar Plus allows users to either utilize this built-in profiler or develop custom profiling methods according to their specific needs.



{% hint style="info" %}
For an example implementation of this tool, refer to Cheesecake Lab's profiling example under&#x20;
{% endhint %}

## Core Features

1. **Automated Data Collection**: Automatically records detailed metrics from smart contract interactions, including method names, transaction costs, and execution times.
2. **Filters**: Enables selective logging through customizable filters, allowing profiling based on specific methods or resource usage parameters.
3. **Aggregation**: Offers data aggregation capabilities, providing summaries of logged information using methods like sum, average, or standard deviation.
4. **Output Formatting**: Facilitates conversion of logs into structured formats such as CSV or text tables, enhancing the readability and analysis of collected data.

## Methods

### getOptionsArgs

* **Arguments**: None.
* **Returns**: `Options` object configured for the profiler. This can be used directly to provide the options for any `ContractEngine` instance.

### getLog

* **Arguments**:
  * `options` (optional): An object of type `GetLogOptions`, which may include:
    * `clear`: Boolean indicating whether to clear the log after retrieval.
    * `filter`: Object specifying filtering criteria.
    * `aggregate`: Object defining aggregation methods.
    * `formatOutput`: String specifying the desired output format ('csv' or 'text-table').
* **Returns**: An array of `LogEntry` objects or a formatted string, depending on the provided options.

### clearLog

* **Arguments**: None.
* **Returns**: Void. Clears the current log entries.

## Setting Up the Soroban Profiler

#### Initializing the Profiler

To start using the Soroban Profiler, you need to create an instance of the profiler from the Stellar Plus library:

```typescript
import { StellarPlus } from "stellar-plus";

const tokenProfiler = new StellarPlus.Utils.SorobanProfiler();
```

#### Integrating Profiler with Soroban Assets

After initializing the Profiler, you can integrate it with instances of smart contract assets, such as Soroban assets. These assets, being extensions of the ContractEngine class, can utilize the profiler through their options.

**Example: Soroban Token Handler**

```typescript
const sorobanTokenWasm = /* Your WASM Buffer */;

const sorobanToken = new StellarPlus.Asset.SorobanTokenHandler({
  network: yourNetworkConfig,
  wasm: sorobanTokenWasm,
  options: tokenProfiler.getOptionsArgs(),
});
```

In this example, the `getOptionsArgs()` method from `tokenProfiler` is used to extract the necessary options, which are then provided to the `SorobanTokenHandler`. This ensures that all interactions with the Soroban token are automatically logged and profiled.

**Example: SAC Handler**

For SAC assets (Stellar Assets on Contract), the setup is similar:

```typescript
const sacProfiler = new StellarPlus.Utils.SorobanProfiler();

console.log("Wrapping Classic Asset into SAC...");
const sacToken = new StellarPlus.Asset.SACHandler({
  network: yourNetworkConfig,
  code: "SAC",
  issuerPublicKey: issuerPublicKey,
  issuerAccount: issuerAccount,
  options: sacProfiler.getOptionsArgs(),
});
```

Here, `sacProfiler` is used to provide profiling options to the `SACHandler`. This integration captures detailed data on method invocations and transaction costs, facilitating in-depth analysis of contract interactions.\


## Filtering Data

#### Filter Options

The Soroban Profiler allows for precise control over the log data through various filtering options:

1. **Method Name Filter**:
   * `methods`: An array of method names. Log entries will be included only for these specified methods.
   * Usage: To focus on specific contract functions.
2. **Resource Usage Filters**:
   * Filters based on specific resource metrics like CPU instructions, RAM, etc.
   * Each resource can be filtered based on minimum (`min`) and/or maximum (`max`) values.
   * Usage: Useful for isolating contract interactions based on resource consumption thresholds.
3. **Include Flag**:
   * `include`: A boolean flag (`true`/`false`) within each resource filter.
   * If `false`, the specific resource is excluded from the log entry.
   * Purpose: Offers control over which resources to log or ignore in each entry.
4. **Combining Filters**:
   * Filters can be combined to create more complex criteria. For instance, you can filter by both method names and specific resource ranges.

#### Applying Filters

To use filters, create a `Filters` object with the desired criteria and pass it to the `getLog` method.

**Example: Filtering by Method Names**

```typescript
const methodFilter = { methods: ['methodName1', 'methodName2'] };
const log = profiler.getLog({ filter: methodFilter });
```

**Example: Resource Usage Filtering**

```typescript
const resourceFilter = {
  cpuInstructions: { min: 1000, max: 5000 },
  ram: { min: 200 }
};
const log = profiler.getLog({ filter: resourceFilter });
```

**Example: Resource Usage Filtering with 'include' Flag**

```typescript
const resourceFilter = {
  cpuInstructions: { min: 1000, max: 5000, include: true },
  ram: { min: 200, include: false }
};
const log = profiler.getLog({ filter: resourceFilter });
```

In this example, the log includes entries with CPU instructions within the specified range and excludes RAM details.

**Example: Combined Filters**

```typescript
const combinedFilter = {
  methods: ['methodName1'],
  ram: { max: 500 },
  transactionSize: { min: 100 }
};
const log = profiler.getLog({ filter: combinedFilter });
```

These filters enable targeted logging of contract interactions, making the analysis of smart contract performance more focused and efficient.\


## Aggregating Data

#### Aggregation Options

The Soroban Profiler offers aggregation functionalities to summarize and analyze log data effectively. This feature is crucial for understanding overall trends and patterns in resource usage and performance over multiple contract interactions.

1. **Resource-Based Aggregation**:
   * Allows summarizing data based on specific resources like CPU instructions, RAM, ledger reads, and more.
   * Aggregation methods include sum, average, and standard deviation.
2. **Elapsed Time Aggregation**:
   * Aggregates the elapsed time for contract method executions.
   * Available methods are the same: sum, average, and standard deviation.
3. **Custom Aggregation**:
   * Developers can specify different aggregation methods for different resources.

#### Implementing Aggregation

To apply aggregation, define an `AggregateType` object specifying the method for each resource or for all resources, and pass it to the `getLog` method.

**Aggregating Specific Resources**

```typescript
const aggregationOptions = {
  cpuInstructions: { method: 'sum' },
  ram: { method: 'average' }
};
const aggregatedLog = profiler.getLog({ aggregate: aggregationOptions });
```

In this example, the profiler will sum the CPU instructions and calculate the average RAM usage across all log entries.

**Aggregating Elapsed Time**

```typescript
const timeAggregation = {
  elapsedTime: { method: 'average' }
};
const timeAggregatedLog = profiler.getLog({ aggregate: timeAggregation });
```

This aggregates the average execution time for the logged contract methods.

**Combined Resource and Time Aggregation**

```typescript
const combinedAggregation = {
  cpuInstructions: { method: 'sum' },
  elapsedTime: { method: 'standardDeviation' }
};
const combinedAggregatedLog = profiler.getLog({ aggregate: combinedAggregation });
```

Here, CPU instructions are summed up, and the standard deviation of execution times is calculated, offering a comprehensive view of resource utilization and performance variability.

**Comprehensive Aggregation**

```typescript
const allAggregation = {
  all: { method: 'sum' }
};
const allAggregatedLog = profiler.getLog({ aggregate: allAggregation });
```

This aggregates all resources using the sum method, providing a total view of resource usage.

Aggregation in the Soroban Profiler simplifies the analysis of extensive log data, providing key insights into the efficiency and performance of smart contract interactions.



## Output Formatting

The Soroban Profiler offers versatile output formatting options, enabling users to transform the aggregated or filtered log data into structured and easily interpretable formats. This feature is particularly useful for reporting and in-depth analysis.

#### Formatting Options

1. **CSV Format**:
   * Converts log data into a comma-separated values (CSV) format.
   * Ideal for exporting data to spreadsheets or data analysis tools.
2. **Text Table Format**:
   * Formats log data into a readable text-based table.
   * Useful for quick reviews or presenting data in a more human-readable format.

#### Applying Formatting

To format the output, specify the desired format in the `getLog` method using the `formatOutput` option.

**Formatting as CSV**

```typescript
const csvFormattedLog = profiler.getLog({ formatOutput: 'csv' });
```

This command converts the profiler log into a CSV format, making it suitable for further analysis in spreadsheet applications or data processing tools.

**Formatting as Text Table**

```typescript
const tableFormattedLog = profiler.getLog({ formatOutput: 'text-table' });
```

This converts the log data into a text table, providing a clear and organized view of the data, which is particularly helpful for immediate analysis or presentation purposes.

#### Example: Combined Use with Filters and Aggregation

```typescript
const combinedOptions = {
  filter: { methods: ['methodName1'], cpuInstructions: { min: 1000 } },
  aggregate: { ram: { method: 'average' } },
  formatOutput: 'csv'
};
const combinedFormattedLog = profiler.getLog(combinedOptions);
```

In this comprehensive example, the log is first filtered by method name and CPU instruction count, then aggregated for average RAM usage, and finally formatted as CSV. This approach demonstrates how the Profiler's features can be combined to extract tailored insights from smart contract interactions, facilitating detailed performance analysis and reporting.
