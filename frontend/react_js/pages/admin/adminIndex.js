import CommonPageHeader from '@/components/common/CommonPageHeader'

export default function AdminDashboardPage() {
  return (
    <section>
      <CommonPageHeader
        title=""
        strongText="관리자 대시보드"
        breadcrumbs={[
          { text: 'Home', link: '/' },
          { text: '관리자페이지', link: '/admin/adminIndex' },
          { text: '관리자 대시보드' }
        ]}
      />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <h2>임시페이지입니다</h2>
          </div>
        </div>
      </div>
    </section>
  )
}

