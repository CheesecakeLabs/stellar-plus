import { Duplex } from 'stream'

import Dockerode, { Container, ContainerInfo } from 'dockerode'
import pRetryDefault, { Options as pRetryOptions } from 'p-retry'
//
// Source refrence: https://github.com/hyperledger/cacti/blob/main/packages/cactus-test-tooling/src/main/typescript/common/containers.ts#L492
export const getByPredicate = async (pred: (ci: ContainerInfo) => boolean): Promise<ContainerInfo> => {
  const docker = new Dockerode()
  const containerList = await docker.listContainers()
  const containerInfo = containerList.find(pred)

  if (!containerInfo) {
    throw new Error(`No container that matches given predicate!`)
  }

  return containerInfo
}

//
// Source refrence: https://github.com/hyperledger/cacti/blob/main/packages/cactus-test-tooling/src/main/typescript/common/containers.ts#L475
export const stop = async (container: Container): Promise<unknown> => {
  const fnTag = 'Containers#stop()'
  return new Promise((resolve, reject) => {
    if (container) {
      container.stop({}, (err: unknown, result: unknown) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    } else {
      return reject(new Error(`${fnTag} Container was not running.`))
    }
  })
}

//
// Source refrence: https://github.com/hyperledger/cacti/blob/main/packages/cactus-test-tooling/src/main/typescript/common/containers.ts#L309
export const exec = async (
  container: Container,
  cmd: string[],
  timeoutMs = 300000, // 5 minutes default timeout
  // logLevel: LogLevelDesc = 'INFO',
  workingDir?: string
): Promise<string> => {
  const fnTag = 'Containers#exec()'
  // Checks.truthy(container, `${fnTag} container`)
  // Checks.truthy(cmd, `${fnTag} cmd`)
  // Checks.truthy(Array.isArray(cmd), `${fnTag} isArray(cmd)`)
  // Checks.truthy(cmd.length > 0, `${fnTag} path non empty array`)
  // Checks.nonBlankString(logLevel, `${fnTag} logLevel`)

  // const log = LoggerProvider.getOrCreate({ label: fnTag, level: logLevel })

  const execOptions: Record<string, unknown> = {
    Cmd: cmd,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  }
  if (workingDir) {
    execOptions.WorkingDir = workingDir
  }
  const exec = await container.exec(execOptions)

  return new Promise((resolve, reject) => {
    console.log(`Calling Exec Start on Docker Engine API...`)

    exec.start({ Tty: true }, (err: Error, stream: Duplex | undefined) => {
      const timeoutIntervalId = setInterval(() => {
        reject(new Error(`Docker Exec timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      if (err) {
        clearInterval(timeoutIntervalId)
        const errorMessage = `Docker Engine API Exec Start Failed:`
        console.log(errorMessage, err)
        throw err
        // return reject( new Error(errorMessage, err))
      }
      if (!stream) {
        const msg = `${fnTag} container engine returned falsy stream object, cannot continue.`
        // return reject(new RuntimeError(msg))
        throw new Error(msg)
      }
      console.log(`Obtained output stream of Exec Start OK`)
      let output = ''
      stream.on('data', (data: Buffer) => {
        output += data.toString('utf-8')
      })
      stream.on('end', () => {
        clearInterval(timeoutIntervalId)
        console.log(`Finished Docker Exec OK. Output: ${output.length} bytes`)
        resolve(output)
      })
    })
  })
}

export const pullImage = (imageFqn: string, options: Record<string, unknown> = {}): Promise<unknown[]> => {
  const task = (): Promise<unknown[]> => tryPullImage(imageFqn, options)
  const retryOptions: pRetryOptions & { retries: number } = {
    retries: 6,
    onFailedAttempt: async (ex) => {
      console.log(`Failed attempt at pulling container image ${imageFqn}`, ex)
    },
  }
  return pRetryDefault(task, retryOptions)
}

const tryPullImage = (imageFqn: string, options: Record<string, unknown> = {}): Promise<unknown[]> => {
  return new Promise((resolve, reject) => {
    const docker = new Dockerode()

    const pullStreamStartedHandler = (pullError: unknown, stream: NodeJS.ReadableStream): void => {
      if (pullError) {
        console.log(`Could not even start ${imageFqn} pull:`, pullError)
        reject(pullError)
      } else {
        console.log(`Started ${imageFqn} pull progress stream OK`)
        docker.modem.followProgress(stream, (progressError: unknown, output: unknown[]) => {
          if (progressError) {
            console.log(`Failed to finish ${imageFqn} pull:`, progressError)
            reject(progressError)
          } else {
            console.log(`Finished ${imageFqn} pull completely OK`)
            resolve(output)
          }
        })
      }
    }

    docker.pull(imageFqn, options, pullStreamStartedHandler)
  })
}
