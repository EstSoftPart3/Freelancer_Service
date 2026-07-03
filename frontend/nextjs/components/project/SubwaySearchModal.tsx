'use client'

// Vue 원본 SubwaySearchModal.vue 이식 — 백엔드 검색 없이 Kakao Places(keywordSearch, category_group_code=SW8)로 클라이언트에서 직접 검색
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { loadKakaoMaps } from '@/lib/kakao'

export interface SubwaySelection {
  placeName: string
  addressName: string
  lat: number
  lng: number
  sigunguCode: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (subway: SubwaySelection) => void
}

interface KakaoPlace {
  place_name: string
  address_name: string
  x: string
  y: string
}

export default function SubwaySearchModal({ open, onClose, onSelect }: Props) {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<KakaoPlace[]>([])
  const [searching, setSearching] = useState(false)

  async function handleSearch() {
    const trimmed = keyword.trim()
    if (!trimmed) return
    setSearching(true)
    try {
      await loadKakaoMaps()
      const places = new window.kakao.maps.services.Places()
      // Kakao Local 검색은 "가좌"만으로는 "가좌역"이 안 잡히는 경우가 있어, "역"을 붙인 쿼리도 같이 검색해 병합한다
      const queries = trimmed.endsWith('역') ? [trimmed] : [trimmed, `${trimmed}역`]
      const merged: KakaoPlace[] = []
      let pending = queries.length

      queries.forEach((q) => {
        places.keywordSearch(
          q,
          (data: KakaoPlace[], status: string) => {
            if (status === window.kakao.maps.services.Status.OK) {
              data.forEach((d) => {
                if (!merged.some((r) => r.place_name === d.place_name && r.address_name === d.address_name)) {
                  merged.push(d)
                }
              })
            }
            pending -= 1
            if (pending === 0) {
              setSearching(false)
              setResults(merged)
              if (merged.length === 0) toast.error('검색 결과가 없습니다.')
            }
          },
          { category_group_code: 'SW8' },
        )
      })
    } catch {
      setSearching(false)
      toast.error('지하철역 검색 중 오류가 발생했습니다.')
    }
  }

  async function handleSelect(place: KakaoPlace) {
    const kakaoMaps = window.kakao.maps
    const geocoder = new kakaoMaps.services.Geocoder()
    geocoder.addressSearch(place.address_name, (result: Array<{ address?: { b_code?: string } }>, status: string) => {
      const sigunguCode = status === kakaoMaps.services.Status.OK ? (result[0]?.address?.b_code ?? '').slice(0, 5) : ''
      onSelect({
        placeName: place.place_name,
        addressName: place.address_name,
        lat: Number(place.y),
        lng: Number(place.x),
        sigunguCode,
      })
      setKeyword('')
      setResults([])
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>지하철역 검색</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="역 이름을 입력하세요 (예: 강남역)"
          />
          <Button onClick={handleSearch} disabled={searching}>검색</Button>
        </div>

        <ul className="max-h-72 divide-y overflow-y-auto">
          {results.map((place, idx) => (
            <li key={`${place.place_name}-${idx}`}>
              <button
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full cursor-pointer px-1 py-2.5 text-left hover:bg-muted/60"
              >
                <p className="text-sm font-medium">{place.place_name}</p>
                <p className="text-xs text-muted-foreground">{place.address_name}</p>
              </button>
            </li>
          ))}
          {results.length === 0 && !searching && (
            <p className="py-8 text-center text-sm text-muted-foreground">역 이름으로 검색해주세요.</p>
          )}
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
