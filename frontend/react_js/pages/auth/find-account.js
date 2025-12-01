import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import styles from './login.module.css'
import FindAccountForm from '@/components/auth/FindAccountForm'
import { useSearchParams } from 'next/navigation'

export default function findAccountPage() {
  const [findType, setFindType] = useState('id')
  const searchParams = useSearchParams();
  useEffect(() => {
    const type = searchParams.get('ft')
    if (type && type !== findType) {
      setFindType(type);
    }
  }, [searchParams, findType])
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
                    className={`btn ${findType === 'ID' ? 'btn-primary' : 'btn-outline btn-primary'}`}
                    style={{ width: '33.33%' }}
                    onClick={() => setFindType('ID')}
                  >
                    아이디 찾기
                  </button>
                  <button
                    className={`btn ${findType === 'PASSWORD' ? 'btn-primary' : 'btn-outline btn-primary'}`}
                    style={{ width: '33.33%' }}
                    onClick={() => setFindType('PASSWORD')}
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



