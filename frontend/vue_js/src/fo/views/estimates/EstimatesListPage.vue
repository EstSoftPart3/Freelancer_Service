<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="견적의뢰"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '견적의뢰' }]"
    />

    <div class="container py-5 mt-3">
      <div class="row">
        <div class="col-lg-8">
          <span
            >어떤 분야의 프로젝트인가요?
            <color style="color: #a4a4a4; font-weight: normal"
              >(중복 선택 가능)</color
            ></span
          >
          <div class="row">
            <!--기획선택박스-->
            <div class="col-sm-10 col-md-7 col-lg-4 mb-4 mb-lg-0">
              <div
                class="featured-boxes featured-boxes-modern-style-2 featured-boxes-modern-style-2-hover-only featured-boxes-modern-style-primary my-4"
              >
                <div class="featured-box">
                  <div class="box-content px-lg-4 px-xl-5 py-lg-5">
                    <i
                      class="icon-featured far fa-heart text-color-primary"
                    ></i>
                    <h2 class="font-weight-normal text-5">기획</h2>
                  </div>
                </div>
              </div>
            </div>
            <!--개발선택박스-->
            <div class="col-sm-10 col-md-7 col-lg-4 mb-4 mb-lg-0">
              <div
                class="featured-boxes featured-boxes-modern-style-2 featured-boxes-modern-style-2-hover-only featured-boxes-modern-style-primary my-4"
              >
                <div class="featured-box">
                  <div class="box-content px-lg-4 px-xl-5 py-lg-5">
                    <i
                      class="icon-featured far fa-heart text-color-primary"
                    ></i>
                    <h2 class="font-weight-normal text-5">개발</h2>
                  </div>
                </div>
              </div>
            </div>
            <!--디자인선택박스-->
            <div class="col-sm-10 col-md-7 col-lg-4 mb-4 mb-lg-0">
              <div
                class="featured-boxes featured-boxes-modern-style-2 featured-boxes-modern-style-2-hover-only featured-boxes-modern-style-primary my-4"
              >
                <div class="featured-box">
                  <div class="box-content px-lg-4 px-xl-5 py-lg-5">
                    <i
                      class="icon-featured far fa-heart text-color-primary"
                    ></i>
                    <h2 class="font-weight-normal text-5">디자인</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!--프로젝트단위-->
          <span>어떤 형태로 모집하시나요?</span>
          <div class="row">
            <div class="col-sm-10 col-md-7 col-lg-4 mb-4 mb-lg-0">
              <div
                class="featured-boxes featured-boxes-modern-style-2 featured-boxes-modern-style-2-hover-only featured-boxes-modern-style-primary my-4"
              >
                <div class="featured-box">
                  <div class="box-content px-lg-4 px-xl-5 py-lg-5">
                    <i
                      class="icon-featured far fa-heart text-color-primary"
                    ></i>
                    <h2 class="font-weight-normal text-5">
                      프로젝트 단위 계약
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            <!--기간/시간제-->
            <div class="col-sm-10 col-md-7 col-lg-4 mb-4 mb-lg-0">
              <div
                class="featured-boxes featured-boxes-modern-style-2 featured-boxes-modern-style-2-hover-only featured-boxes-modern-style-primary my-4"
              >
                <div class="featured-box">
                  <div class="box-content px-lg-4 px-xl-5 py-lg-5">
                    <i
                      class="icon-featured far fa-heart text-color-primary"
                    ></i>
                    <h2 class="font-weight-normal text-5">
                      개인 인력의 기간/시간제 계약
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!--선택시 활성화 라디오버튼-->
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="inlineRadioOptions1"
              id="inlineRadio1"
              value="option1"
            />
            <label class="form-check-label" for="inlineRadio1"
              >기간제 상주입니다.</label
            >
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="inlineRadioOptions2"
              id="inlineRadio2"
              value="option2"
            />
            <label class="form-check-label" for="inlineRadio2"
              >시간제 상주입니다.</label
            >
          </div>
          <!--프로젝트-->
          <div class="mt-5 mb-2">
            <span>프로젝트 진행상황을 알려주세요</span>
          </div>
          <!--신규프로젝트-->
          <div class="row">
            <div class="col-sm-10 col-md-7 col-lg-4 mb-4 mb-lg-0">
              <div
                class="featured-boxes featured-boxes-modern-style-2 featured-boxes-modern-style-2-hover-only featured-boxes-modern-style-primary my-4"
              >
                <div class="featured-box">
                  <div class="box-content px-lg-4 px-xl-5 py-lg-5">
                    <i
                      class="icon-featured far fa-heart text-color-primary"
                    ></i>
                    <h2 class="font-weight-normal text-5">신규 프로젝트</h2>
                  </div>
                </div>
              </div>
            </div>
            <!--유지보수, 고도화-->
            <div class="col-sm-10 col-md-7 col-lg-4 mb-4 mb-lg-0">
              <div
                class="featured-boxes featured-boxes-modern-style-2 featured-boxes-modern-style-2-hover-only featured-boxes-modern-style-primary my-4"
              >
                <div class="featured-box">
                  <div class="box-content px-lg-4 px-xl-5 py-lg-5">
                    <i
                      class="icon-featured far fa-heart text-color-primary"
                    ></i>
                    <h2 class="font-weight-normal text-5">유지보수,고도화</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!--예산설정-->
          <div class="mt-5 mb-2">
            <span>생각하시는 프로젝트 예산을 알려주세요</span>
          </div>

          <select class="form-select form-control border-color-quaternary mb-3">
            <option value="null">선택해주세요</option>
            <option value="1">1만원~100만원</option>
            <option value="2">100만원~200만원</option>
            <option value="3">200만원~300만원</option>
            <option value="4">300만원~500만원</option>
            <option value="5">500만원~1000만원</option>
            <option value="6">1000만원~2000만원</option>
            <option value="7">2000만원~3000만원</option>
            <option value="8">3000만원~5000만원</option>
            <option value="9">5000만원~1억</option>
            <option value="10">1억이상</option>
            <option value="0">직접입력</option>
          </select>
          <div class="mb-3">
            <input
              type="text"
              class="form-control border-color-quaternary"
              placeholder="직접 입력 선택 시 활성화 (예: 450만원)"
            />
          </div>

          <div class="custom-checkbox-1">
            <input
              id="createAccount"
              type="checkbox"
              name="createAccount"
              value="1"
            />
            <label for="createAccount">잘 모르겠어요</label>
          </div>
          <!--예상기간-->
          <div class="mt-5 mb-2">
            <span>예상기간</span>
          </div>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label text-2 font-weight-bold text-dark"
                >예상 시작일</label
              >
              <div class="input-group">
                <span class="input-group-text border-color-quaternary bg-light">
                  <i class="fas fa-calendar-alt text-color-primary"></i>
                </span>
                <input
                  type="date"
                  class="form-control border-color-quaternary"
                />
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label text-2 font-weight-bold text-dark"
                >예상 종료일</label
              >
              <div class="input-group">
                <span class="input-group-text border-color-quaternary bg-light">
                  <i class="fas fa-calendar-alt text-color-primary"></i>
                </span>
                <input
                  type="date"
                  class="form-control border-color-quaternary"
                />
              </div>
            </div>
          </div>
          <div class="custom-checkbox-1">
            <input
              id="createAccount1"
              type="checkbox"
              name="createAccount1"
              value="1"
            />
            <label for="createAccount1">잘 모르겠어요</label>
          </div>
          <!--운영서비스 링크-->
          <div class="mt-5 mb-2">
            <span>운영중인 서비스나 참고할만한 서비스가 있을까요?</span>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="inlineRadioOptions3"
              id="inlineRadio3"
              value="option3"
            />
            <label class="form-check-label" for="inlineRadio3"
              >현재 운영 서비스</label
            >
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="inlineRadioOptions4"
              id="inlineRadio4"
              value="option4"
            />
            <label class="form-check-label" for="inlineRadio4"
              >참고 서비스</label
            >
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="inlineRadioOptions5"
              id="inlineRadio5"
              value="option5"
            />
            <label class="form-check-label" for="inlineRadio5">없음</label>
          </div>
          <div class="mb-3">
            <input
              type="text"
              class="form-control border-color-quaternary"
              placeholder="(예: 프리랜서 서비스, www.Freelancer.net)"
            />
          </div>
          <hr />
          <a href="#" class="btn btn-modern btn-rounded btn-secondary mb-2"
            >견적 의뢰하기</a
          >
        </div>
        <!--공고미리보기-->
        <div
          class="col-lg-4 position-sticky"
          style="top: 200px; height: fit-content"
        >
          <div class="card border-width-2 border-color-primary shadow-sm">
            <div class="card-body p-4">
              <h5
                class="card-title font-weight-bold text-4 text-dark mb-3 pb-2 border-bottom"
              >
                <i class="fas fa-eye text-color-primary me-2"></i> 공고 미리보기
              </h5>

              <ul class="list list-icons list-primary list-unstyled text-3">
                <li class="mb-2">
                  <i class="fas fa-check text-2"></i>
                  <strong class="text-dark">프로젝트 분야:</strong>
                  <span class="text-muted ms-1">기획 / 개발</span>
                </li>
                <li class="mb-2">
                  <i class="fas fa-check text-2"></i>
                  <strong class="text-dark">모집 형태:</strong>
                  <span class="text-muted ms-1">기간제 상주</span>
                </li>
                <li class="mb-2">
                  <i class="fas fa-check text-2"></i>
                  <strong class="text-dark">진행상황:</strong>
                  <span class="text-muted ms-1">신규 프로젝트</span>
                </li>
                <li class="mb-2">
                  <i class="fas fa-check text-2"></i>
                  <strong class="text-dark">예산 범위:</strong>
                  <span class="text-muted ms-1">500만원 ~ 1,000만원</span>
                </li>
                <li class="mb-2">
                  <i class="fas fa-check text-2"></i>
                  <strong class="text-dark">예상 시작일:</strong>
                  <span class="text-muted ms-1">2026-06-01</span>
                </li>
                <li class="mb-2">
                  <i class="fas fa-check text-2"></i>
                  <strong class="text-dark">예상 종료일:</strong>
                  <span class="text-muted ms-1">2026-06-01</span>
                </li>
                <li class="mb-3">
                  <i class="fas fa-check text-2"></i>
                  <strong class="text-dark">참고 서비스</strong>
                  <span class="text-muted ms-1">있음</span>
                </li>
              </ul>

              <div class="bg-light p-3 rounded text-2 text-muted mb-0">
                <i class="fas fa-info-circle text-color-info me-1"></i>
                입력하신 정보가 실시간으로 반영되어 파트너들에게 노출될
                공고카드가 미리 구성됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--레이아웃틀-->
    </div>
  </section>
</template>
<script setup>
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
</script>
