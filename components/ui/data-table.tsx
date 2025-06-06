import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  title: string
  data: T[]
  columns: Column<T>[]
  actions?: (item: T) => React.ReactNode
}

export function DataTable<T extends { id: string | number }>({ title, data, columns, actions }: DataTableProps<T>) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title} ({data.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              {columns.map((column) => (
                <TableHead key={String(column.key)} className="text-gray-600 font-medium">
                  {column.label}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className="border-gray-100 hover:bg-gray-50/50">
                {columns.map((column) => (
                  <TableCell key={String(column.key)} className="text-gray-900">
                    {column.render ? column.render(item) : String(item[column.key as keyof T])}
                  </TableCell>
                ))}
                {actions && <TableCell className="text-right">{actions(item)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
