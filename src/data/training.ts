import type { ComponentScore, StageSummary, TrainingChart, TrainingStage } from '../types'

export const trainingRun = {
  model: 'Qwen/Qwen3-8B',
  trainedModel: 'cart-scout-qwen3-8b-grpo',
  trainData: 'data/shopping_train_1000.jsonl',
  window: '2026-06-21 05:21-11:36',
  totalRollouts: 220,
  totalTasks: 50,
  hardZeroRate: 0.4591,
  hardZeroRollouts: 101,
}

export const trainingStages = [
  {
    optimStep: 1,
    label: 'Concurrency smoke test',
    taskWindow: 'rows 0-4',
    rollouts: 20,
    rewardMean: 0.2918,
    rewardMin: 0,
    rewardMax: 0.9,
    rewardStdev: 0.368,
    judged: false,
  },
  {
    optimStep: 2,
    label: 'Chunk 1',
    taskWindow: 'rows 0-24',
    rollouts: 100,
    rewardMean: 0.4195,
    rewardMin: 0,
    rewardMax: 0.97,
    rewardStdev: 0.3808,
    judged: true,
  },
  {
    optimStep: 3,
    label: 'Chunk 2',
    taskWindow: 'rows 25-49',
    rollouts: 100,
    rewardMean: 0.3658,
    rewardMin: 0,
    rewardMax: 0.958,
    rewardStdev: 0.3786,
    judged: true,
  },
] satisfies TrainingStage[]

export const stageSummaries = [
  {
    stage: 'smoke_test',
    rowRange: 'rows 0-4',
    rolloutsLogged: 20,
    hardZeroRate: 0.6,
    infraRunFailures: 1,
  },
  {
    stage: 'chunk_1',
    rowRange: 'rows 0-24',
    rolloutsLogged: 100,
    hardZeroRate: 0.41,
    infraRunFailures: 11,
  },
  {
    stage: 'chunk_2',
    rowRange: 'rows 25-49',
    rolloutsLogged: 100,
    hardZeroRate: 0.48,
    infraRunFailures: 14,
  },
] satisfies StageSummary[]

export const componentScores = [
  { component: 'must_have', mean: 0.2372, zeroRate: 0 },
  { component: 'price', mean: 0.1379, zeroRate: 0 },
  { component: 'evidence_quality', mean: 0.1147, zeroRate: 0 },
  { component: 'domain', mean: 0.0924, zeroRate: 0.0756 },
  { component: 'must_not', mean: 0.0807, zeroRate: 0.4202 },
  { component: 'format', mean: 0.05, zeroRate: 0 },
  { component: 'compression', mean: 0.05, zeroRate: 0 },
  { component: 'recommendation', mean: 0.0466, zeroRate: 0 },
] satisfies ComponentScore[]

export const solvedTasks = [
  {
    taskId: 'train_0016_coffee-filters-for-a-small-apartment',
    meanReward: 0.9287,
  },
  {
    taskId: 'train_0003_a-shower-curtain-liner-for-a-budget-restock',
    meanReward: 0.8641,
  },
  {
    taskId: 'train_0049_kitchen-trash-bags-for-a-basic-starter-kit',
    meanReward: 0.847,
  },
]

export const resultCharts = [
  {
    title: 'Reward mean progression',
    src: '/results/reward_mean_progression.png',
    note: 'Training reward by optimization step from results/training_stats.csv.',
  },
  {
    title: 'Reward distribution per stage',
    src: '/results/reward_distribution_per_stage.png',
    note: 'Rollout reward spread across smoke test and training chunks.',
  },
  {
    title: 'Reward breakdown',
    src: '/results/reward_breakdown_by_component.png',
    note: 'Mean component reward scores by training stage.',
  },
  {
    title: 'Hard-zero rate',
    src: '/results/error_analysis_hard_zero_rate.png',
    note: 'Rate of rollouts that scored zero by stage.',
  },
] satisfies TrainingChart[]
