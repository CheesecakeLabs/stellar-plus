/* eslint-disable import/no-duplicates */
// Reference Stellar quickstart docker image https://hub.docker.com/r/stellar/quickstart/

import EventEmitter from 'events'

import { Container } from 'dockerode'
import Dockerode from 'dockerode'

import { NetworkConfig, NetworksList } from 'stellar-plus/network'

import { ILocalStellarLedger, ILocalStellarLedgerConstructorOptions } from './types'
import { pullImage, stop } from '../utils/docker'

/*
 * Provides default options for Fabric container
 */
const DEFAULT_OPTS = Object.freeze({
  imageName: 'stellar/quickstart',
  imageVersion: 'latest',
})

const DEFAULT_CMD = ['--local', '--limits', 'testnet']
export const LOCAL_STELLAR_LEDGER_DEFAULT_OPTIONS = DEFAULT_OPTS

export class LocalStellarLedger implements ILocalStellarLedger {
  public static readonly CLASS_NAME = 'LocalStellarLedger'
  private container?: Container | null
  private containerId: string | undefined

  public readonly imageVersion: string
  public readonly imageName: string
  constructor(options?: ILocalStellarLedgerConstructorOptions) {
    this.imageName = options?.imageName || DEFAULT_OPTS.imageName
    this.imageVersion = options?.imageVersion || DEFAULT_OPTS.imageVersion
  }

  public getContainerImageName(): string {
    return `${this.imageName}:${this.imageVersion}`
  }

  public getContainerId(): string | undefined {
    return this.containerId
  }

  public getContainer(): Container {
    const fnTag = 'LocalStellarLedger#getContainer()'
    if (!this.container) {
      throw new Error(`${fnTag} container not yet started by this instance.`)
    } else {
      return this.container
    }
  }

  public getNetworkConfig(): NetworkConfig {
    return {
      name: NetworksList.custom,
      networkPassphrase: 'Test SDF Network ; September 2015',
      friendbotUrl: 'https://friendbot.stellar.org',
      horizonUrl: 'https://horizon-testnet.stellar.org',
      rpcUrl: 'http://localhost:8000',
    }
  }
  // public async start(): Promise<Container> {
  //   const containerNameAndTag = this.getContainerImageName()
  //   const containerInfo = await getByPredicate((ci) => ci.Image === containerNameAndTag && ci.State === 'running')
  //   const docker = new Docker()
  //   this.containerId = containerInfo.Id
  //   this.container = docker.getContainer(this.containerId)
  //   return this.container
  // }

  public async start(omitPull?: boolean): Promise<Container> {
    const docker = new Dockerode()
    if (this.getContainerId()) {
      console.log(`Container ID provided. Will not start new one.`)
      const container = docker.getContainer(this.getContainerId() as string)
      return container
    }
    if (!omitPull) {
      await pullImage(this.getContainerImageName(), {})
    }

    const dockerEnvVars: string[] = new Array(...new Map()).map((pairs) => `${pairs[0]}=${pairs[1]}`)

    const createOptions = {
      HostConfig: {
        AutoRemove: true,
        Env: dockerEnvVars,
        Privileged: true,
        PublishAllPorts: true,
      },
    }

    console.log(`Starting ${this.getContainerImageName()} with options: `, createOptions)

    return new Promise<Container>((resolve, reject) => {
      const eventEmitter: EventEmitter = docker.run(
        this.getContainerImageName(),
        [...DEFAULT_CMD],
        [],
        createOptions,
        {},
        (err: Error) => {
          if (err) {
            const errorMessage = `Failed to start container ${this.getContainerImageName()}`
            const exception = new Error(errorMessage)
            console.log(exception)
            reject(exception)
          }
        }
      )

      eventEmitter.once('start', async (container: Container) => {
        const { id } = container
        await console.log(`Started ${this.getContainerImageName()} successfully. ID=${id}`)
        this.containerId = id

        try {
          // await Containers.waitForHealthCheck(this.containerId.get())

          this.container = container
          await this.containerId
          resolve(container)
        } catch (ex) {
          reject(ex)
        }
      })
    })
  }

  public stop(): Promise<unknown> {
    if (this.container) {
      return stop(this.container)
    } else {
      return Promise.reject(new Error(`Container was never created, nothing to stop.`))
    }
  }

  public async destroy(): Promise<unknown> {
    try {
      if (!this.container) {
        throw new Error(`Container not found, nothing to destroy.`)
      }
      const docker = new Dockerode()
      const containerInfo = await this.container.inspect()
      const volumes = containerInfo.Mounts
      await this.container.remove()
      volumes.forEach(async (volume) => {
        console.log('Removing volume: ', volume)
        if (volume.Name) {
          const volumeToDelete = docker.getVolume(volume.Name)
          await volumeToDelete.remove()
        } else {
          console.log('Volume', volume, 'could not be removed')
        }
      })

      return Promise.resolve()
    } catch (error) {
      console.log(error)
      throw new Error(`${error}"`)
    }
  }
}
