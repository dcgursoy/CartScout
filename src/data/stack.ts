import type { StackPartner } from '../types'

export const stackPartners = [
  {
    name: 'HUD',
    mark: 'H',
    image: '/stack-images/hud.png',
    imageAlt: 'HUD logo',
    role: 'RL environments and evals',
    description:
      'Structured browser tasks, rollout traces, rewards, and repeatable evaluation loops.',
  },
  {
    name: 'Fireworks AI',
    mark: 'F',
    image: '/stack-images/fireworks.png',
    imageAlt: 'Fireworks AI logo',
    role: 'Inference and model deployment',
    description:
      'Fast hosted open-model inference plus the deployment surface for Qwen-family agents.',
  },
  {
    name: 'Qwen3-VL-8B',
    mark: 'Q',
    image: '/stack-images/qwen.png',
    imageAlt: 'Qwen logo',
    role: 'Small visual browser policy',
    description:
      'A compact multimodal model trained toward the same browser workflows at a smaller scale.',
  },
  {
    name: 'compressr',
    mark: 'c',
    image: '/stack-images/compressr.png',
    imageAlt: 'compressr logo',
    role: 'Task-aware context compressor',
    description:
      'Squashes noisy browser state into constraints, evidence, action candidates, and risks.',
  },
  {
    name: 'Y Combinator',
    mark: 'Y',
    image: '/stack-images/y-combinator.svg',
    imageAlt: 'Y Combinator stack mark',
    role: 'Startup network',
    description:
      'Company-building ecosystem and launch context for the CartScout browser agent story.',
  },
] satisfies StackPartner[]
