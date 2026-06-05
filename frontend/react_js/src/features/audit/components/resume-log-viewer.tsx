import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Phone, Mail, MapPin, Calendar, Building, BookOpen, Award, Terminal, FileText } from 'lucide-react'

interface ResumeLogViewerProps {
  data: any
}

export function ResumeLogViewer({ data }: ResumeLogViewerProps) {
  if (!data) return <div className="text-muted-foreground p-4">데이터가 없습니다.</div>

  const safeStr = (str: any) => str || '-'

  return (
    <div className="space-y-6">
      {/* 1. 이력서 제목 및 기본 정보 */}
      <Card className="border-t-4 border-t-blue-600 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">
            {safeStr(data.resumeTtl)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* 프로필 이미지 영역 */}
            <div className="w-32 h-40 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden shrink-0">
              {data.profileImage && data.profileImage.url ? (
                <img src={data.profileImage.url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-300" />
              )}
            </div>

            {/* 기본 정보 텍스트 영역 */}
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-muted-foreground" />
                  <span className="font-semibold w-16">이름</span>
                  <span>{safeStr(data.resumeNm)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span className="font-semibold w-16">생년월일</span>
                  <span>{safeStr(data.resumeBirthDt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-muted-foreground" />
                  <span className="font-semibold w-16">연락처</span>
                  <span>{safeStr(data.resumePhoneNum)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="font-semibold w-16">이메일</span>
                  <span>{safeStr(data.resumeEmail)}</span>
                </div>
                {data.address && (
                  <div className="flex items-start gap-2 col-span-1 md:col-span-2">
                    <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                    <span className="font-semibold w-16 shrink-0">주소</span>
                    <span className="break-all">
                      [{safeStr(data.address.zonecode)}] {safeStr(data.address.address)} {safeStr(data.address.detailAddress)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 학력 사항 */}
      {data.educationList && data.educationList.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="py-3 bg-muted/30 border-b">
            <CardTitle className="text-md flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" /> 학력 사항
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {data.educationList.map((edu: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm p-3 bg-gray-50 rounded-md border border-gray-100">
                  <div className="font-medium">
                    {safeStr(edu.educationSchoolNm)} <span className="text-muted-foreground font-normal">| {safeStr(edu.educationMajorNm)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <span className="text-xs text-muted-foreground">{safeStr(edu.educationAdmissionDt)} ~ {safeStr(edu.educationGraduationDt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. 경력 사항 */}
      {data.careerList && data.careerList.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="py-3 bg-muted/30 border-b">
            <CardTitle className="text-md flex items-center gap-2">
              <Building size={18} className="text-blue-600" /> 경력 사항
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {data.careerList.map((career: any, idx: number) => (
                <div key={idx} className="flex flex-col text-sm p-3 bg-gray-50 rounded-md border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-base">{safeStr(career.careerCompanyNm)}</span>
                    <span className="text-xs text-muted-foreground">{safeStr(career.careerStartDt)} ~ {safeStr(career.careerEndDt)}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {safeStr(career.careerDepartmentNm)} | {safeStr(career.careerPositionNm)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. 자격증 및 교육이력 */}
      {((data.certificationList && data.certificationList.length > 0) || (data.trainingHistoryList && data.trainingHistoryList.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 자격증 */}
          {data.certificationList && data.certificationList.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="py-3 bg-muted/30 border-b">
                <CardTitle className="text-md flex items-center gap-2">
                  <Award size={18} className="text-blue-600" /> 자격증
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {data.certificationList.map((cert: any, idx: number) => (
                    <li key={idx} className="text-sm flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <span className="font-medium">{safeStr(cert.certificationNm)}</span>
                      <span className="text-xs text-muted-foreground">{safeStr(cert.certificationIssuerNm)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 교육 이력 */}
          {data.trainingHistoryList && data.trainingHistoryList.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="py-3 bg-muted/30 border-b">
                <CardTitle className="text-md flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" /> 교육 이력
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {data.trainingHistoryList.map((train: any, idx: number) => (
                    <li key={idx} className="text-sm flex flex-col border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <span className="font-medium">{safeStr(train.trainingProgramNm)}</span>
                      <span className="text-xs text-muted-foreground">{safeStr(train.trainingInstitutionNm)} ({safeStr(train.trainingStartDt)} ~ {safeStr(train.trainingEndDt)})</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 5. 보유 기술 */}
      {data.skillTagList && data.skillTagList.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="py-3 bg-muted/30 border-b">
            <CardTitle className="text-md flex items-center gap-2">
              <Terminal size={18} className="text-blue-600" /> 보유 기술
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {data.skillTagList.map((tag: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1 font-normal bg-blue-50 text-blue-700 hover:bg-blue-100">
                  {safeStr(tag.skillTagNm)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. 자기소개 */}
      {data.resumeGreetingTxt && (
        <Card className="shadow-sm bg-gray-50">
          <CardHeader className="py-3 border-b border-gray-200">
            <CardTitle className="text-md flex items-center gap-2">
              <FileText size={18} className="text-gray-700" /> 자기소개
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-sm leading-relaxed whitespace-pre-wrap">
            {data.resumeGreetingTxt}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
