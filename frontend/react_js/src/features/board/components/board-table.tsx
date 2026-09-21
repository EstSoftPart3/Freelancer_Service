// src/features/board/components/board-table.tsx
import { useEffect, useState, useMemo } from 'react'
// sorting 관리를 위해 추가
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { boardApi } from '../api/board-api'
import { ANSWER_TYPE_CD, BOARD_TYPE_BADGE, LEGACY_BOARD_META, MANAGED_BOARD_TYPES } from '../data/board-type'
import { type AdminBoard } from '../data/schema'
import { boardColumns as columns } from './board-columns'

// 서버 필터링이므로 테이블의 columnFilters 는 URL 상태를 그대로 비추는 파생값이다.
function buildColumnFilters(typeCds: number[], categoryCds: number[]) {
  const filters: { id: string; value: string[] }[] = []
  if (typeCds.length) filters.push({ id: 'boardTypeCd', value: typeCds.map(String) })
  if (categoryCds.length)
    filters.push({ id: 'boardCategoryCd', value: categoryCds.map(String) })
  return filters
}

interface BoardTableProps {
  data: AdminBoard[]
  totalCount: number
  page: number
  typeCds: number[]
  categoryCds: number[]
  keyword: string
  sortField: string
  sortOrder: string
  setKeyword: (val: string) => void
  setPage: (page: number) => void
  onSort: (field: string, order: string) => void
  onFilterType: (types: number[]) => void
  onFilterCategory: (categories: number[]) => void
  setTagKeyword: (val: string) => void
}

export function BoardTable({
  data,
  totalCount,
  page,
  typeCds,
  categoryCds,
  keyword,
  sortField,
  sortOrder,
  setKeyword,
  setPage,
  onSort,
  onFilterType,
  onFilterCategory,
  setTagKeyword: _setTagKeyword,
}: BoardTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: string }[]
  >([])

  // 카테고리 필터는 유형과 별개 축(전역 다중선택)이라, 관리 대상 5종 게시판 + 레거시
  // 일반게시판(1401, 이관 후에도 목록엔 여전히 남는다)의 중분류를 전부 모아 한 번에 보여준다.
  // 이름이 서로 겹치지 않아 게시판 구분 없이 평평하게 나열해도 된다.
  useEffect(() => {
    let cancelled = false
    const legacyPaths = Object.values(LEGACY_BOARD_META)
      .filter((t) => t.hasCategory)
      .map((t) => t.path)
    Promise.all(
      [...MANAGED_BOARD_TYPES.filter((t) => t.hasCategory).map((t) => t.path), ...legacyPaths].map((path) =>
        boardApi.getBoardCategories(path).then((res) => res.output ?? [])
      )
    ).then((lists) => {
      if (cancelled) return
      setCategoryOptions(
        lists.flat().map((c) => ({
          label: c.commonCodeNm,
          value: String(c.commonCodeSq),
        }))
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  const sorting = useMemo(
    () => [{ id: sortField, desc: sortOrder === 'DESC' }],
    [sortField, sortOrder]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting, // [해결] 이제 정의한 sorting을 사용합니다.
      globalFilter: keyword,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: 10,
      },
      columnFilters: buildColumnFilters(typeCds, categoryCds),
    },
    enableRowSelection: true, // 행 선택 기능 활성화
    onRowSelectionChange: setRowSelection, // [연결] 행 선택 변경 함수 연결
    onGlobalFilterChange: setKeyword, // [연결] 사용하지 않던 setKeyword 연결
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalCount / 10),
    enableMultiSort: false,

    onSortingChange: (updater) => {
      // 현재 sorting 상태를 넘겨서 다음 정렬 상태를 계산합니다.
      const nextSorting =
        typeof updater === 'function' ? updater(sorting) : updater

      if (nextSorting.length > 0) {
        const newField = nextSorting[0].id
        const newOrder = nextSorting[0].desc ? 'DESC' : 'ASC'

        onSort(newField, newOrder)
      } else {
        onSort('createdAt', 'DESC')
      }
    },

    onPaginationChange: (updater) => {
      const nextState =
        typeof updater === 'function'
          ? updater({ pageIndex: page - 1, pageSize: 10 })
          : updater
      setPage(nextState.pageIndex + 1)
    },

    onColumnFiltersChange: (updater) => {
      const currentFilters = buildColumnFilters(typeCds, categoryCds)
      const nextFilters =
        typeof updater === 'function' ? updater(currentFilters) : updater

      // 필터는 서버(URL 파라미터)가 정본이므로, 변경된 것만 골라 올리지 않고
      // 두 축을 매번 함께 반영한다. 한쪽만 올리면 다른 축이 조용히 초기화된다.
      const typeFilter = nextFilters.find((f) => f.id === 'boardTypeCd')
      const categoryFilter = nextFilters.find((f) => f.id === 'boardCategoryCd')
      onFilterType(typeFilter ? (typeFilter.value as string[]).map(Number) : [])
      onFilterCategory(
        categoryFilter ? (categoryFilter.value as string[]).map(Number) : []
      )
    },

    getCoreRowModel: getCoreRowModel(),
  })

  // 관리 목록(managedTypeCds)엔 이관 후에도 옛 유형(1401·1402) 글이 여전히 남아 보이므로,
  // 새 글 작성 선택지(MANAGED_BOARD_TYPES)만으로 필터를 구성하면 그 글들을 걸러볼 방법이
  // 없어진다 — LEGACY_BOARD_META 키(1401·1402)를 필터 전용으로 추가한다.
  const typeOptions = [
    ...Object.keys(LEGACY_BOARD_META).map((code) => ({
      label: BOARD_TYPE_BADGE[Number(code)]?.label ?? code,
      value: code,
    })),
    ...MANAGED_BOARD_TYPES.map((t) => ({ label: t.label, value: String(t.code) })),
    { label: '답변', value: String(ANSWER_TYPE_CD) },
  ]

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='제목, 작성자 검색...'
        // [중요] 검색 입력창의 값이 부모의 keyword와 동기화되도록 함
        // 만약 DataTableToolbar 내부에서 입력을 따로 관리한다면 그 컴포넌트 수정이 필요함
        filters={[
          {
            columnId: 'boardTypeCd',
            title: '게시글 유형',
            options: typeOptions,
          },
          {
            columnId: 'boardCategoryCd',
            title: '카테고리',
            options: categoryOptions,
          },
        ]}
      />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
