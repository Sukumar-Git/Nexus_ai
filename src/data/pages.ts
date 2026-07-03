import { SimulatedPage } from '../types';

export const SIMULATED_PAGES: SimulatedPage[] = [
  {
    id: 'p1',
    title: 'Quantum Computing — Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Quantum_computing',
    category: 'Science',
    readTime: '8 min read',
    author: 'Wikipedia Contributors',
    content: `Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers. 

Today, IBM, Google, and other research groups are building quantum systems that operate with particles called qubits. Unlike a classical bit, which can represent a 0 or a 1, a qubit can exist in a state of superposition. This allows quantum systems to calculate multiple probabilities simultaneously.

Superposition and Entanglement
Superposition is the ability of a quantum system to be in multiple states at the same time until it is measured. Entanglement is a strong correlation that exists between quantum particles, such that the state of one particle instantaneously influences the state of another, no matter how far apart they are. Einstein famously called this "spooky action at a distance".

Decoherence and Error Correction
One of the greatest challenges in physical quantum computers is decoherence. Qubits are highly sensitive to environmental noise, such as heat, magnetic fields, and cosmic rays. Even tiny disturbances can cause qubits to lose their quantum state, leading to errors in calculation. To combat this, researchers are developing Quantum Error Correction (QEC) algorithms, which spread information across multiple physical qubits to create a single stable "logical qubit".

Potential Applications:
1. Cryptography: Quantum computers running Shor's Algorithm could theoretically break standard RSA public-key encryption, necessitating the development of post-quantum cryptography.
2. Molecular Modeling: Simulating molecular structures for chemical engineering, potentially leading to new drug discoveries or high-capacity batteries.
3. Optimization: Solving extremely complex logistics, financial modeling, and supply chain routing problems in seconds.`
  },
  {
    id: 'p2',
    title: 'Understanding Javascript Async/Await — MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function',
    category: 'Engineering',
    readTime: '5 min read',
    author: 'Mozilla Developer Network',
    content: `The "async" and "await" keywords provide a clean, synchronous-looking syntax for working with asynchronous Promise-based operations in JavaScript.

An async function is a function declared with the "async" keyword. Within it, the "await" keyword is permitted to pause execution until a Promise is resolved or rejected, returning the resolved value directly.

Why Async/Await?
Historically, JavaScript handled asynchronous tasks with nested callbacks, which often resulted in "callback hell" or "pyramid of doom" structures that were hard to read and debug. ES6 introduced Promises, which improved control flow with .then() and .catch() chains, but could still become verbose and difficult to wrap in standard try/catch error blocks. Async/await brings the readability of synchronous control flow to asynchronous execution.

How it Works:
When an async function is called, it returns a Promise. When the async function returns a value, the Promise will be resolved with that value. If the async function throws an exception, the Promise will be rejected with that thrown value.

Code Pattern:
async function fetchUserDashboard(userId) {
  try {
    const user = await db.users.find(userId);
    const preferences = await db.preferences.getFor(userId);
    const activity = await db.logs.getRecent(userId);
    return { user, preferences, activity };
  } catch (error) {
    console.error("Failed to compile dashboard metrics:", error);
    throw error;
  }
}

Important details:
- "await" only pauses the current async function context, leaving the main thread unblocked to process other events.
- If you await multiple non-dependent promises sequentially, it can cause unnecessary performance bottlenecks. Instead, resolve them concurrently using Promise.all().`
  },
  {
    id: 'p3',
    title: 'The Rise of Agentic Workflows in GenAI — Tech Blog',
    url: 'https://techblog.nexus/rise-of-agentic-workflows-genai',
    category: 'Artificial Intelligence',
    readTime: '6 min read',
    author: 'Sarah Jenkins, Chief AI Architect',
    content: `Artificial Intelligence is undergoing a massive paradigm shift. We are moving from simple "zero-shot" prompting (where an LLM outputs a complete response in a single pass) to iterative, agentic workflows.

In an agentic workflow, an AI model is not just a passive answer generator, but an active agent. It iterates on its own work, uses external computational tools, searches the web, delegates sub-tasks to specialized sub-agents, and verifies its own outputs before returning them to the user.

Key Design Patterns of AI Agents:
1. Reflection: The agent generates a draft, critiques its own output for errors or missing context, and writes a revised draft. This simple feedback loop dramatically increases code and writing quality.
2. Tool Use: The agent can choose to call external APIs, query relational databases, or run local code execution environments to gather facts or perform math calculations.
3. Planning: The model breaks a complex user prompt down into a series of logical steps, executes them sequentially, and dynamically updates its plan based on intermediate results.
4. Multi-agent Collaboration: Multiple specialized models communicate with each other, dividing labor. For instance, a PM agent outlines specifications, a Coder agent writes code, and a QA agent lints and tests the code.

Why This Matters:
Agentic workflows achieve superior results on complex reasoning, coding, and logical tasks even when powered by smaller, faster models. By shifting from instantaneous zero-shot responses to thoughtful multi-step reasoning, we unlock the true potential of generative AI companions like Nexus.`
  }
];
