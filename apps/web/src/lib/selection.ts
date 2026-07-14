export function getSelectedRowIds(selection: Record<string, boolean>): string[] {
  return Object.keys(selection).filter((id) => selection[id]);
}

export function selectedRowCount(selection: Record<string, boolean>): number {
  return getSelectedRowIds(selection).length;
}
