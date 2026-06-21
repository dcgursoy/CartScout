export type MetricSnapshot = {
  modelLabel: string
  modelShort: string
  sourceFile: string
  records: number
  completed: number
  errors: number
  avgReward: number
  successCount: number
  rewards: number[]
  note: string
}

export type StackPartner = {
  name: string
  mark: string
  image: string
  imageAlt: string
  role: string
  description: string
}

export type TrainingStage = {
  optimStep: number
  label: string
  taskWindow: string
  rollouts: number
  rewardMean: number
  rewardMin: number
  rewardMax: number
  rewardStdev: number
  judged: boolean
}

export type StageSummary = {
  stage: string
  rowRange: string
  rolloutsLogged: number
  hardZeroRate: number
  infraRunFailures: number
}

export type ComponentScore = {
  component: string
  mean: number
  zeroRate: number
}

export type TrainingChart = {
  title: string
  src: string
  note: string
}
