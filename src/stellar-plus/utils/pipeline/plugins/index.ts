export const filterPluginsByType = <PluginType extends { type?: string }, BeltType>(
  plugins: PluginType[],
  typeFilter: BeltType
): PluginType[] => {
  return plugins.filter((plugin) => plugin.type === typeFilter)
}

export const filterPluginsByName = <PluginType extends { name?: string }>(
  plugins: PluginType[],
  nameFilter: string
): PluginType[] => {
  return plugins.filter((plugin) => plugin.name === nameFilter)
}
