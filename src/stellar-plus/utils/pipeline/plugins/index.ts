import { GenericPlugin } from '../conveyor-belts/types'

export const filterPluginsByType = <PluginType extends { type?: string }, BeltType>(
  plugins: PluginType[],
  typeFilter: BeltType
): PluginType[] => {
  return plugins.filter((plugin) => plugin.type === typeFilter)
}

export const filterPluginsByTypes = <PluginType extends { type: string | GenericPlugin }, BeltType>(
  plugins: PluginType[],
  typesFilter: BeltType[],
  invertResult: boolean = false //When true, reuturns only plugins that do not match the typesFilter
): PluginType[] => {
  if (invertResult) {
    return plugins.filter((plugin) => !typesFilter.includes(plugin.type as BeltType))
  }
  return plugins.filter((plugin) => typesFilter.includes(plugin.type as BeltType))
}

export const filterPluginsByName = <PluginType extends { name?: string }>(
  plugins: PluginType[],
  nameFilter: string
): PluginType[] => {
  return plugins.filter((plugin) => plugin.name === nameFilter)
}
