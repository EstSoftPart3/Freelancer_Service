import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/freelancers/approvals')({
  component: FreelancerApprovals,
})

function FreelancerApprovals() {
  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold'>전문가 승인 관리</h1>
      <p className='mt-4'>프리랜서 승인 대기 내역을 확인하는 곳입니다.</p>
    </div>
  )
}