import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const defaultEvalDir = '/Users/rushendra/Desktop/shiva_hud/ScourRL/data/hard_evals'
const evalDir = path.resolve(process.env.SCOURRL_EVAL_DIR || defaultEvalDir)
const outputPath = path.join(projectRoot, 'src/data/metrics.ts')

const snapshots = [
  {
    modelLabel: 'Qwen3-VL-8B small agent',
    modelShort: 'Qwen 8B',
    sourceFile: 'baseline_qwen3_vl_8b_next20.jsonl',
    note: 'Separate 20-task hard eval batch using the deployed Qwen 8B endpoint.',
  },
  {
    modelLabel: 'Qwen3-VL-8B first hard batch',
    modelShort: 'Qwen 8B A',
    sourceFile: 'baseline_spfgo7uy_hard_20.jsonl',
    note: 'Earlier hard eval batch with the same working Fireworks deployment.',
  },
  {
    modelLabel: 'Frontier reference snapshot',
    modelShort: 'Reference',
    sourceFile: 'baseline_claude_sonnet_4_6_hard_20.jsonl',
    note: 'Local reference snapshot for context; not the main small-model claim.',
  },
]

function readReward(record) {
  const candidates = [
    record.reward,
    record.final_reward,
    record.score,
    record.result?.reward,
    record.evaluation?.reward,
    record.metrics?.reward,
  ]
  const reward = candidates.find((value) => typeof value === 'number' && Number.isFinite(value))
  return reward ?? 0
}

function isError(record) {
  if (record.error || record.exception || record.traceback) return true
  if (typeof record.status === 'string' && /error|fail|timeout/i.test(record.status)) return true
  return false
}

async function readJsonl(sourceFile) {
  const fullPath = path.join(evalDir, sourceFile)
  const text = await readFile(fullPath, 'utf8')
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line)
      } catch (error) {
        throw new Error(`${sourceFile}:${index + 1} is not valid JSON: ${error.message}`)
      }
    })
}

function summarize(config, records) {
  const rewards = records.map(readReward)
  const errors = records.filter(isError).length
  const avgReward =
    rewards.length === 0
      ? 0
      : Number((rewards.reduce((total, reward) => total + reward, 0) / rewards.length).toFixed(4))

  return {
    ...config,
    records: records.length,
    completed: records.length - errors,
    errors,
    avgReward,
    successCount: rewards.filter((reward) => reward >= 0.9).length,
    rewards,
  }
}

function toTypeScript(data) {
  return `import type { MetricSnapshot } from '../types'

// Generated from local ScourRL hard eval JSONL files.
// Rebuild with: npm run ingest:metrics
export const metricSnapshots = ${JSON.stringify(data, null, 2)} satisfies MetricSnapshot[]
`
}

const data = []
for (const snapshot of snapshots) {
  const records = await readJsonl(snapshot.sourceFile)
  data.push(summarize(snapshot, records))
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, toTypeScript(data))

console.log(`Wrote ${path.relative(projectRoot, outputPath)} from ${evalDir}`)
