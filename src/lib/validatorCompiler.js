export const validatorCompiler = ({ schema }) => (data) => {
  try {
    const result = schema.validateSync(data)
    return { value: result }
  } catch (e) {
    return { error: e }
  }
}
