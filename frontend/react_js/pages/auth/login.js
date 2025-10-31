import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const { setUserInfo } = useAuth()
  const { showAlert } = useAlert()

  const [loginType, setLoginType] = useState('PERSONAL')
  const [form, setForm] = useState({
    id: '',
    password: '',
    cid: '',
    cpassword: '',
    autologin: false,
    id_save: false,
  })

  const socialProviders = [
    {
      name: 'kakao',
      title: '카카오 로그인',
      img: '/img/social/kakao.png',
    },
    {
      name: 'naver',
      title: '네이버 로그인',
      img: '/img/social/naver.png',
    },
    {
      name: 'google',
      title: '구글 로그인',
      img: '/img/social/google.png',
    },
    {
      name: 'apple',
      title: '애플 로그인',
      img: '/img/social/apple.png',
    },
  ]

  // 저장된 아이디 로드
  const loadSavedId = () => {
    const savedType = localStorage.getItem('savedLoginType')
    if (savedType) {
      setLoginType(savedType)
    }
    if (loginType === 'PERSONAL') {
      setForm(prev => ({
        ...prev,
        id: localStorage.getItem('savedPersonalId') || '',
        id_save: !!localStorage.getItem('savedPersonalId')
      }))
    } else {
      setForm(prev => ({
        ...prev,
        cid: localStorage.getItem('savedCompanyId') || '',
        id_save: !!localStorage.getItem('savedCompanyId')
      }))
    }

    // 자동 로그인 여부 로드
    setForm(prev => ({
      ...prev,
      autologin: localStorage.getItem('autoLogin') === 'true'
    }))
  }

  // 유저 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const res = await api.$post('/me')
      const data = res.output

      localStorage.setItem('userNm', data.userNm)
      localStorage.setItem('userTypeCd', data.userTypeCd)

      setUserInfo({
        userSq: data.userSq,
        userNm: data.userNm,
        userTypeCd: data.userTypeCd,
      })
    } catch (error) {
      console.error('유저 정보 불러오기 실패:', error)
      showAlert('로그인 정보가 만료되었습니다. 다시 로그인 해주세요.', 'danger')
      router.push('/auth/login')
    }
  }

  // 로그인 처리
  const login = async (e) => {
    e.preventDefault()

    const type = loginType
    const userTypeCd = type === 'PERSONAL' ? 301 : 302
    const id = type === 'PERSONAL' ? form.id : form.cid
    const pw = type === 'PERSONAL' ? form.password : form.cpassword

    const payload = {
      userId: id,
      userPw: pw,
      userTypeCd,
      autoLogin: form.autologin,
    }

    try {
      const response = await api.$post('/login', payload)
      const token = response.output.token
      
      if (token && token.accessToken && token.refreshToken) {
        localStorage.setItem('accessToken', token.accessToken)
        localStorage.setItem('refreshToken', token.refreshToken)
      } else {
        throw new Error('토큰 정보가 응답에 포함되지 않았습니다.')
      }

      await fetchUserInfo()

      // 아이디 저장
      if (form.id_save) {
        if (type === 'PERSONAL') {
          localStorage.setItem('savedPersonalId', form.id)
        } else {
          localStorage.setItem('savedCompanyId', form.cid)
        }
        localStorage.setItem('savedLoginType', loginType)
      } else {
        localStorage.removeItem('savedPersonalId')
        localStorage.removeItem('savedCompanyId')
        localStorage.removeItem('savedLoginType')
      }

      // 자동 로그인 저장
      if (form.autologin) {
        localStorage.setItem('autoLogin', 'true')
      } else {
        localStorage.removeItem('autoLogin')
      }

      const userName = localStorage.getItem('userNm')
      showAlert(`${userName}님 안녕하세요.`, 'success')
      router.push('/')
    } catch (error) {
      console.error(error)
      showAlert(error.response?.data?.message || error.message, 'danger')
    }
  }

  const handleSocialLogin = (provider) => {
    showAlert(`${provider} 로그인은 준비 중입니다.`, 'danger')
  }

  // 컴포넌트 마운트 시 저장된 아이디 로드
  useEffect(() => {
    loadSavedId()
  }, [])

  // loginType 변경 시 저장된 아이디 변경 반영
  useEffect(() => {
    if (loginType === 'PERSONAL') {
      setForm(prev => ({
        ...prev,
        id: localStorage.getItem('savedPersonalId') || ''
      }))
    } else {
      setForm(prev => ({
        ...prev,
        cid: localStorage.getItem('savedCompanyId') || ''
      }))
    }
  }, [loginType])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <section>
      <CommonPageHeader
        title=""
        strongText="회원 로그인"
        breadcrumbs={[{ text: 'Home', link: '/' }, { text: 'Login' }]}
      />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-4">
                {/* 회원 유형 토글 버튼 */}
                <div className="btn-group w-100 mb-4" role="group">
                  <button
                    className={`btn w-50 ${loginType === 'PERSONAL' ? 'btn-primary' : 'btn-outline btn-primary'}`}
                    onClick={() => setLoginType('PERSONAL')}
                  >
                    개인회원
                  </button>
                  <button
                    className={`btn w-50 ${loginType === 'COMPANY' ? 'btn-primary' : 'btn-outline btn-primary'}`}
                    onClick={() => setLoginType('COMPANY')}
                  >
                    기업회원
                  </button>
                </div>

                {/* 로그인 폼 */}
                <form onSubmit={login}>
                  <input
                    type="hidden"
                    value={loginType === 'PERSONAL' ? 'p' : 'c'}
                    name="login_tab"
                  />

                  {/* ID 입력 */}
                  <div className="mb-3">
                    <label htmlFor="id" className="form-label">아이디</label>
                    {loginType === 'PERSONAL' ? (
                      <input
                        type="text"
                        className="form-control"
                        id="id"
                        name="id"
                        value={form.id}
                        onChange={handleInputChange}
                        required
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        id="cid"
                        name="cid"
                        value={form.cid}
                        onChange={handleInputChange}
                        required
                      />
                    )}
                  </div>

                  {/* 비밀번호 입력 */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">비밀번호</label>
                    {loginType === 'PERSONAL' ? (
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        maxLength="32"
                        required
                      />
                    ) : (
                      <input
                        type="password"
                        className="form-control"
                        id="cpassword"
                        name="cpassword"
                        value={form.cpassword}
                        onChange={handleInputChange}
                        maxLength="32"
                        required
                      />
                    )}
                  </div>

                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`autologin_${loginType}`}
                      name="autologin"
                      checked={form.autologin}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor={`autologin_${loginType}`}>
                      로그인 유지
                    </label>
                  </div>

                  <div className="form-check mb-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`id_save_${loginType}`}
                      name="id_save"
                      checked={form.id_save}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor={`id_save_${loginType}`}>
                      아이디 저장
                    </label>
                  </div>

                  <div className="d-grid mb-3">
                    <button type="submit" className="btn btn-primary btn-block">
                      로그인
                    </button>
                  </div>

                  <div className="d-flex justify-content-between mb-4">
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault()
                        router.push({
                          pathname: '/auth/signup',
                          query: { loginType }
                        })
                      }}
                    >
                      회원가입
                    </a>
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push('/auth/find-account')
                      }}
                    >
                      아이디/비밀번호 찾기
                    </a>
                  </div>
                </form>

                {/* 소셜 로그인 */}
                <hr className="my-4" />
                <p className="text-center mb-3">소셜 계정으로 로그인</p>
                <div className="d-flex justify-content-center gap-3">
                  {socialProviders.map(provider => (
                    <button
                      key={provider.name}
                      className={`btn ${styles.btnIcon} rounded-circle border`}
                      title={provider.title}
                      onClick={() => handleSocialLogin(provider.name)}
                    >
                      <img
                        src={provider.img}
                        alt=""
                        className="w-100 h-100 object-fit-cover rounded-circle"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}



