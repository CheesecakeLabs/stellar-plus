import { DebugPlugin } from './debug'
import { InjectPreprocessParameterPlugin } from './inject-preprocess-parameter'

export const genericPlugins = {
  debug: DebugPlugin,
  injectPreprocessParameter: InjectPreprocessParameterPlugin,
}
