// GroIntel ROS-3 — Agent Memory
import { AgentMemory, AgentGoal } from "./agent_types";

export class AgentMemoryManager {
  create(): AgentMemory {
    return {
      episodic: [], semantic: {}, working: {},
      goals: [], workflow_history: [], decision_history: [], learning_history: [],
    };
  }

  recordEpisodic(memory: AgentMemory, event: string, significance: number): void {
    memory.episodic = [...memory.episodic, { timestamp: new Date().toISOString(), event, significance }].sort((a, b) => b.significance - a.significance);
  }

  recordWorkflow(memory: AgentMemory, instanceId: string, defId: string, status: string): void {
    memory.workflow_history = [...memory.workflow_history, { instance_id: instanceId, definition_id: defId, status, completed_at: null }];
  }

  recordDecision(memory: AgentMemory, decision: string, confidence: number): void {
    memory.decision_history = [...memory.decision_history, { timestamp: new Date().toISOString(), decision, confidence }];
  }

  recordLearning(memory: AgentMemory, insight: string, source: string): void {
    memory.learning_history = [...memory.learning_history, { timestamp: new Date().toISOString(), insight, source }];
  }

  updateWorking(memory: AgentMemory, key: string, value: unknown): void {
    memory.working = { ...memory.working, [key]: value };
  }

  countWorkflows(memory: AgentMemory): number { return memory.workflow_history.length; }
  countDecisions(memory: AgentMemory): number { return memory.decision_history.length; }
}
