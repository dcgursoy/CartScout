import type { StackPartner } from '../types'

export const stackPartners = [
  {
    name: 'HUD',
    mark: 'H',
    role: 'RL environments and evals',
    description:
      'Structured browser tasks, rollout traces, rewards, and repeatable evaluation loops.',
  },
  {
    name: 'Fireworks AI',
    mark: 'F',
    role: 'Inference and model deployment',
    description:
      'Fast hosted open-model inference plus the deployment surface for Qwen-family agents.',
  },
  {
    name: 'Qwen3-VL-8B',
    mark: 'Q',
    role: 'Small visual browser policy',
    description:
      'A compact multimodal model trained toward the same browser workflows at a smaller scale.',
  },
  {
    name: 'compressr',
    mark: 'c',
    role: 'Task-aware context compressor',
    description:
      'Squashes noisy browser state into constraints, evidence, action candidates, and risks.',
  },
  {
    name: 'Y Combinator',
    mark: 'Y',
    role: 'Startup network',
    description:
      'Company-building ecosystem and launch context for the CartScout browser agent story.',
  },
] satisfies StackPartner[]
