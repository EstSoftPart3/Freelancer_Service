import { useState, useEffect } from 'react'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import FindAccountForm from '@/components/auth/FindAccountForm'
import { useRouter, useSearchParams } from 'next/navigation'

export default function findAccountPage() {
  const [findType, setFindType] = useState('id')
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const ft = searchParams.get('ft')
    if (ft === 'password') {
      setFindType('password')
    } else {
      setFindType('id')
    }
  }, [searchParams])

  // ======== 이벤트 핸들러 ==========
  const handleFindTypeChange = (ft) => {
    setFindType(ft);
    router.push(`/auth/find-account${ft === 'password' ? '?ft=password' : ''}`)
  }

  return (
    <section>
      <CommonPageHeader
        title=""
        strongText="회원 찾기"
        breadcrumbs={[{ text: 'Home', link: '/' }, { text: 'Find-Account' }]}
      />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-10">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-4">
                {/* 회원 유형 토글 버튼 */}
                <div className="btn-group w-100 mb-4" role="group">
                  <button
                    className={`btn ${findType === 'id' ? 'btn-primary' : 'btn-outline btn-primary'}`}
                    style={{ width: '33.33%' }}
                    onClick={() => handleFindTypeChange('id')}
                  >
                    아이디 찾기
                  </button>
                  <button
                    className={`btn ${findType === 'password' ? 'btn-primary' : 'btn-outline btn-primary'}`}
                    style={{ width: '33.33%' }}
                    onClick={() => handleFindTypeChange('password')}
                  >
                    비밀번호 찾기
                  </button>
                </div>
                {/* 회원 찾기 폼 */}
                <FindAccountForm findType={findType} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}



