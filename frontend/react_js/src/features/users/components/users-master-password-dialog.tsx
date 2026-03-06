import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { userApi } from '../api/users-api'
import { useUsers } from './users-provider'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersMasterPasswordDialog({ open, onOpenChange }: Props) {
  const { setOpen, pendingFormData, setPendingFormData } = useUsers()
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (!password) return
    setIsLoading(true)
    try {
      await userApi.verifyPassword(password)
    } catch {
      toast.error('비밀번호가 맞지 않습니다.')
    }

    try {
      //인증 후 실제 API 호출
      if (pendingFormData) {
        await userApi.updateUser(
          pendingFormData.userSq,
          pendingFormData.formData
        )
        setPendingFormData(null)
        setPassword('')
        setOpen(null)
        toast.success('유저 정보가 수정되었습니다.')
        setTimeout(() => window.location.reload(), 500)
      }
    } catch {
      toast.error('유저 정보 수정 중 오류가 발생하였습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) setPassword('')
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>마스터 비밀번호 확인</DialogTitle>
          <DialogDescription>
            유저 정보를 수정하려면 마스터 비밀번호를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2 py-2'>
          <Label htmlFor='master-password'>비밀번호</Label>
          <Input
            id='master-password'
            type='password'
            autoComplete='current-password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
        </div>
      </DialogContent>

      <DialogFooter>
        <Button variant='outline' onClick={() => onOpenChange(false)}>
          취소
        </Button>
        <Button onClick={handleConfirm} disabled={!password || isLoading}>
          확인
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
